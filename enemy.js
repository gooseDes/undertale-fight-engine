import { to_draw, to_update } from "./global.js";

export class Enemy {
    constructor(canvas, type, x, y, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.type = type;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.speedAngle = 0;
        this.field = null;
        this.oldFieldOffsetX = 0;
        this.oldFieldOffsetY = 0;
        this.opacity = 1;
        this.damage = 1;
        this.gravityX = 0;
        this.gravityY = 0;
    }

    setMovement(x, y) {
        this.speedX = x;
        this.speedY = y;
        return this;
    }

    setGravity(x, y) {
        this.gravityX = x;
        this.gravityY = y;
        return this;
    }

    update(dt) {
        if (this.oldFieldOffsetX != this.field.currentOffsetX) {
            this.x += this.field.currentOffsetX - this.oldFieldOffsetX;
        }
        if (this.oldFieldOffsetY != this.field.currentOffsetY) {
            this.y += this.field.currentOffsetY - this.oldFieldOffsetY;
        }

        this.oldFieldOffsetX = this.field.currentOffsetX;
        this.oldFieldOffsetY = this.field.currentOffsetY;
        
        this.speedX += this.gravityX;
        this.speedY += this.gravityY;
        this.x += this.speedX * dt * this.w;
        this.y += this.speedY * dt * this.w;
        this.angle += this.speedAngle * dt;

        switch (this.type) {
            case 'blaster':
                let grow = dt * this.w * 10;
                this.width += grow;

                this.x += Math.cos(this.angle) * grow * 0.5;
                this.y += Math.sin(this.angle) * grow * 0.5;

                this.opacity -= dt * 1.5;
                if (this.opacity < 0) {
                    to_update.splice(to_update.indexOf(this), 1);
                    to_draw.splice(to_draw.indexOf(this), 1);
                    this.field.enemies.splice(this.field.enemies.indexOf(this), 1);
                }
                this.damage = 0.5;
                break;
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.angle);
        this.ctx.globalAlpha = this.opacity;
        switch (this.type) {
            case 'blaster':
                this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                break;
            default:
                this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                break;
        }
        this.ctx.restore();
    }
}