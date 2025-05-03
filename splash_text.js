import { to_draw, to_update } from "./global.js";

export class SplashText {
    constructor(canvas, width, height, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = "";
        this.alpha = 1.0;
        this.speedY = -12;
    }

    update(dt) {
        this.alpha -= dt * 0.5;
        this.y += this.speedY * dt * 10;
        this.speedY += 0.2;
        if (this.alpha < 0) {
            this.alpha = 0;
            to_update.splice(to_update.indexOf(this), 1);
            to_draw.splice(to_draw.indexOf(this), 1);
        }
    }

    draw() {
        this.ctx.fillStyle = `rgb(200, 200, 200, ${this.alpha})`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${this.width * 0.05}px undertale`;
        this.ctx.fillText(this.text, this.x, this.y);
    }
}