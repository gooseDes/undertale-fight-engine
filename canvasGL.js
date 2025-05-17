export class CanvasGL {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    if (!this.gl) throw new Error('WebGL not supported');

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this._globalAlpha = 1.0;
    this._textCanvas = document.createElement('canvas');
    this._textCtx = this._textCanvas.getContext('2d');
    this._imageCache = new Map();

    this.color = [1, 1, 1, 1];
    this.strokeColor = [1, 1, 1, 1];
    this.lineWidth = 1;
    this.textAlign = 'left';
    this.textBaseline = 'top';
    this.font = '16px sans-serif';
    this.stateStack = [];

    this.currentState = {
      color: [...this.color],
      strokeColor: [...this.strokeColor],
      transform: glMatrix.mat3.create(),
      globalAlpha: 1.0
    };

    this._initShaders();
    this._initBuffers();

    this._texture = this.gl.createTexture();
  }

  get globalAlpha() {
    return this._globalAlpha;
  }

  set globalAlpha(value) {
    this._globalAlpha = Math.max(0, Math.min(1, value));
    this.currentState.globalAlpha = this._globalAlpha;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  _initShaders() {
    const gl = this.gl;
    const vs = `
      attribute vec2 position;
      attribute vec2 texcoord;
      uniform mat3 uMatrix;
      varying vec2 vTexcoord;
      void main() {
        vec3 pos = uMatrix * vec3(position, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
        vTexcoord = texcoord;
      }
    `;

    const fs = `
      precision mediump float;
      uniform vec4 uColor;
      uniform sampler2D uImage;
      uniform bool useTexture;
      varying vec2 vTexcoord;
      void main() {
        if (useTexture) {
          gl_FragColor = texture2D(uImage, vTexcoord) * uColor;
        } else {
          gl_FragColor = uColor;
        }
      }
    `;

    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);
    this.program = prog;

    this.attribs = {
      position: gl.getAttribLocation(prog, 'position'),
      texcoord: gl.getAttribLocation(prog, 'texcoord'),
    };

    this.uniforms = {
      uColor: gl.getUniformLocation(prog, 'uColor'),
      uImage: gl.getUniformLocation(prog, 'uImage'),
      useTexture: gl.getUniformLocation(prog, 'useTexture'),
      uMatrix: gl.getUniformLocation(prog, 'uMatrix'),
    };
  }

  _initBuffers() {
    const gl = this.gl;
    this.posBuffer = gl.createBuffer();
    this.texBuffer = gl.createBuffer();
  }

  _rectToVerts(x, y, w, h) {
    return new Float32Array([
      x, y, x + w, y, x, y + h,
      x, y + h, x + w, y, x + w, y + h
    ]);
  }

  _getOrthoMatrix() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const m = glMatrix.mat3.create();
    glMatrix.mat3.set(m,
      2 / w, 0, 0,
      0, -2 / h, 0,
      -1, 1, 1
    );
    return m;
  }

  _applyTransform() {
    const ortho = this._getOrthoMatrix();
    const model = glMatrix.mat3.clone(this.currentState.transform);
    const mvp = glMatrix.mat3.create();
    glMatrix.mat3.multiply(mvp, ortho, model);
    this.gl.uniformMatrix3fv(this.uniforms.uMatrix, false, mvp);
  }

  fillRect(x, y, w, h) {
    const gl = this.gl;
    const verts = this._rectToVerts(x, y, w, h);
    gl.useProgram(this.program);
    this._applyTransform();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.attribs.position);
    gl.disableVertexAttribArray(this.attribs.texcoord);

    gl.uniform1i(this.uniforms.useTexture, false);
    const colorWithAlpha = [...this.color];
    colorWithAlpha[3] *= this._globalAlpha;
    gl.uniform4fv(this.uniforms.uColor, colorWithAlpha);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  clearRect(x, y, w, h) {
    const gl = this.gl;
    const prevBlend = gl.isEnabled(gl.BLEND);
    const prevColor = [...this.color];
    const prevAlpha = this._globalAlpha;
    gl.disable(gl.BLEND);
    this.color = [0, 0, 0, 0];
    this._globalAlpha = 1;
    this.fillRect(x, y, w, h);
    if (prevBlend) gl.enable(gl.BLEND);
    else gl.disable(gl.BLEND);
    this.color = prevColor;
    this._globalAlpha = prevAlpha;
  }


  strokeRect(x, y, w, h) {
    const oldColor = this.color;
    this.color = [...this.strokeColor];
    this.fillRect(x, y, w, this.lineWidth);
    this.fillRect(x, y + h - this.lineWidth, w, this.lineWidth);
    this.fillRect(x, y, this.lineWidth, h);
    this.fillRect(x + w - this.lineWidth, y, this.lineWidth, h);
    this.color = oldColor;
  }

  drawImage(image, x, y, w, h) {
    const gl = this.gl;
    const verts = this._rectToVerts(x, y, w, h);
    const texcoords = new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]);

    gl.useProgram(this.program);
    this._applyTransform();

    const isCanvas = image instanceof HTMLCanvasElement;
    const isImage = image instanceof HTMLImageElement;

    let texture;

    if (isImage && (!image.complete || image.naturalWidth === 0)) {
      return;
    }

    if (!isCanvas && this._imageCache.has(image)) {
      texture = this._imageCache.get(image);
    } else {
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      if (!isCanvas) {
        this._imageCache.set(image, texture);
      }
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.attribs.position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.attribs.texcoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.attribs.texcoord);

    gl.uniform1i(this.uniforms.useTexture, true);
    gl.uniform1i(this.uniforms.uImage, 0);
    gl.uniform4f(this.uniforms.uColor, 1, 1, 1, this._globalAlpha);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }


  fillText(text, x, y) {
    const ctx = this._textCtx;
    ctx.font = this.font;
    const metrics = ctx.measureText(text);
    const w = Math.ceil(metrics.width);
    const h = Math.ceil(parseInt(this.font, 10) || 16);

    this._textCanvas.width = w;
    this._textCanvas.height = h;
    ctx.font = this.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = this._globalAlpha;
    ctx.clearRect(0, 0, w, h);
    ctx.fillText(text, 0, 0);

    if (this.textAlign === 'center') x -= w / 2;
    if (this.textBaseline === 'middle') y -= h / 2;

    this.drawImage(this._textCanvas, x, y, w, h);
  }

  measureText(text) {
    this._textCtx.font = this.font;
    return this._textCtx.measureText(text);
  }

  save() {
    this.stateStack.push({
      color: [...this.currentState.color],
      strokeColor: [...this.strokeColor],
      transform: glMatrix.mat3.clone(this.currentState.transform),
      globalAlpha: this._globalAlpha
    });
  }

  restore() {
    if (this.stateStack.length) {
      const state = this.stateStack.pop();
      this.currentState = {
        color: [...state.color],
        strokeColor: [...state.strokeColor],
        transform: glMatrix.mat3.clone(state.transform),
        globalAlpha: state.globalAlpha
      };
      this._globalAlpha = state.globalAlpha;
    }
  }

  set fillStyle(v) {
    this.color = this._parseColor(v);
    this.currentState.color = [...this.color];
  }

  set strokeStyle(v) {
    this.strokeColor = this._parseColor(v);
  }

  get strokeStyle() {
    return this.strokeColor;
  }

  translate(x, y) {
    glMatrix.mat3.translate(this.currentState.transform, this.currentState.transform, [x, y]);
  }

  rotate(angle) {
    glMatrix.mat3.rotate(this.currentState.transform, this.currentState.transform, angle);
  }

  scale(x, y) {
    glMatrix.mat3.scale(this.currentState.transform, this.currentState.transform, [x, y]);
  }

  resetTransform() {
    this.currentState.transform = glMatrix.mat3.create();
  }

  clear(color = [0, 0, 0, 1]) {
    this.gl.clearColor(...color);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  _parseColor(v) {
    if (typeof v === 'string' && v.startsWith('#')) {
      const hex = v.slice(1);
      const num = parseInt(hex.length <= 4 ? hex.repeat(2) : hex, 16);
      const a = this._globalAlpha;
      if (hex.length === 6 || hex.length === 3) {
        return [
          ((num >> 16) & 0xff) / 255,
          ((num >> 8) & 0xff) / 255,
          (num & 0xff) / 255,
          a
        ];
      } else if (hex.length === 8 || hex.length === 4) {
        return [
          ((num >> 24) & 0xff) / 255,
          ((num >> 16) & 0xff) / 255,
          ((num >> 8) & 0xff) / 255,
          (num & 0xff) / 255
        ];
      }
    } else if (Array.isArray(v)) {
      return v;
    }
    return [1, 1, 1, this._globalAlpha];
  }
}
