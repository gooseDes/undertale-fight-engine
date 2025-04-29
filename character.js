export class Character {
    constructor(canvas, face, body, legs, width, height, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.face = face;
        this.body = body;
        this.legs = legs;
        this.faceOffset = this.face.y;
        this.bodyOffset = this.body.y;
        this.legsOffset = this.legs.y;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }

    update(dt) {
        this.face.x = this.x - this.face.width/2 + Math.sin(performance.now()*0.001)*this.w*0.002;
        this.body.x = this.x - this.body.width/2 - Math.sin(performance.now()*0.001)*this.w*0.002;
        this.legs.x = this.x - this.legs.width/2 - Math.cos(performance.now()*0.001)*this.w*0.001;
        this.face.y = this.y + Math.cos(performance.now()*0.002)*this.h*0.005 + this.faceOffset;
        this.body.y = this.y + this.face.height + this.bodyOffset;
        this.legs.y = this.y + this.face.height + this.legs.height + this.legsOffset;
    }

    draw() {
        this.face.draw();
        this.body.draw();
        this.legs.draw();
    }
}