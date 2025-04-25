export class Field {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        console.log(this.w, this.h);
        this.width = this.w * 0.5;
        this.height = this.w * 0.2;
        this.lineWidth = this.w * 0.01;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    update(dt) {
        
    }

    draw() {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeRect(this.w*0.5 - this.width*0.5 + this.offsetX, this.h*0.5 - this.height*0.5 + this.offsetY, this.width, this.height);
    }
}