import { missMessages } from "/src/dialogs.js";
import { to_draw, to_update } from "/src/global.js";
import { SplashText } from "/src/splash_text.js";

export class Character {
    constructor(canvas, ctx, face, body, legs, width, height, x, y) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.face = face;
        this.body = body;
        this.legs = legs;
        this.faceOffsetX = this.face.x;
        this.bodyOffsetX = this.body.x;
        this.legsOffsetX = this.legs.x
        this.faceOffsetY = this.face.y;
        this.bodyOffsetY = this.body.y;
        this.legsOffsetY = this.legs.y;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }

    damage() {
        const splash = new SplashText(this.canvas, this.ctx, this.w, this.h, this.x, this.y + this.height);
        splash.text = missMessages[Math.floor(Math.random() * missMessages.length)];
        to_update.push(splash);
        to_draw.push(splash);
    }

    update(dt) {
        this.face.x = this.x - this.face.width / 2 + Math.sin(performance.now() * 0.001) * this.w * 0.002 + this.faceOffsetX;
        this.body.x = this.x - this.body.width / 2 - Math.sin(performance.now() * 0.001) * this.w * 0.002 + this.bodyOffsetX;
        this.legs.x = this.x - this.legs.width / 2 - Math.cos(performance.now() * 0.001) * this.w * 0.001 + this.legsOffsetX;
        this.face.y = this.y + Math.cos(performance.now() * 0.002) * this.h * 0.005 + this.faceOffsetY;
        this.body.y = this.y + this.face.height + this.bodyOffsetY;
        this.legs.y = this.y + this.face.height + this.legs.height + this.legsOffsetY;
    }

    draw() {
        this.face.draw();
        this.body.draw();
        this.legs.draw();
    }
}