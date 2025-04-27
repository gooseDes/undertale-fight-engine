export class Enemy {
    constructor(canvas, type, x, y, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.field = null;
    }

    setMovement(x, y) {
        this.speedX = x;
        this.speedY = y;
    }

    update(dt) {
        this.x += this.speedX * dt * this.w;
        this.y += this.speedY * dt * this.w;
    }

    draw() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}