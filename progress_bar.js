export class ProgressBar {
    constructor(canvas, width, height, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.value = 1;
        this.actualValue = 1;
        this.min = 0;
        this.max = 100;
    }

    update(dt) {
        this.actualValue += (this.value - this.actualValue) * dt * 8;
    }

    draw() {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = '#eeee00';
        this.ctx.fillRect(this.x, this.y, this.width * this.actualValue, this.height);
        this.ctx.clearRect(this.x, this.y, this.height*0.1, this.height*0.1);
        this.ctx.clearRect(this.x+this.width-this.height*0.1, this.y, this.height*0.1, this.height*0.1);
        this.ctx.clearRect(this.x, this.y+this.height-this.height*0.1, this.height*0.1, this.height*0.1);
        this.ctx.clearRect(this.x+this.width-this.height*0.1, this.y+this.height-this.height*0.1, this.height*0.1, this.height*0.1);
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'white'
        this.ctx.font = `${this.height}px undertale`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = this.w*0.004;
        this.ctx.fillText(Math.round(this.value*this.max), this.x+this.width*0.5, this.y+this.height*0.5, this.width);
    }
}