export class Particle {
    constructor(canvas, ctx, action, speed, size, x, y) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.action = action;
        this.speed = speed;
        this.size = size;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.alpha = 1;
        if (this.action == 'bg') {
            this.alpha = 4;
        }
    }
    update(dt) {
        if (this.action == 'bg') {
            this.x = this.startX + Math.sin(performance.now()*0.001+this.startY) * (this.w*0.01);
            this.y -= this.speed * dt;
            this.alpha -= this.speed * dt * 0.035;
            if (this.alpha <= 0) {
                this.x = this.startX;
                this.y = this.startY;
                this.alpha = this.w*0.005;
            }
        }
    }
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.fillStyle = `#ff0000`;
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
        this.ctx.restore();
    }
}