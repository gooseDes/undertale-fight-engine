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
    }

    setMovement(x, y) {
        this.speedX = x;
        this.speedY = y;
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
        
        this.x += this.speedX * dt * this.w;
        this.y += this.speedY * dt * this.w;
        this.angle += this.speedAngle * dt;

        switch (this.type) {
            case 'blaster':
                this.opacity -= dt;
                if (this.opacity < 0) {
                    to_update.splice(to_update.indexOf(this), 1);
                    to_draw.splice(to_draw.indexOf(this), 1);
                    this.field.enemies.splice(this.field.enemies.indexOf(this), 1);
                }
                break;
        }
    }

    draw() {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        switch (this.type) {
            case 'bone':
                const radius = this.width / 1.6;
                const x = this.x, y = this.y, w = this.width, h = this.height;
                this.ctx.fillRect(this.x, this.y, this.width, this.height);
    
                this.ctx.beginPath();
                this.ctx.arc(x + radius * 1.3, y + h, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
    
                this.ctx.beginPath();
                this.ctx.arc(x + w - radius * 1.3, y + h, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
    
                this.ctx.beginPath();
                this.ctx.arc(x + radius * 1.3, y, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
    
                this.ctx.beginPath();
                this.ctx.arc(x + w - radius * 1.3, y, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
    
                break;
            
            case 'blaster':
                this.ctx.save();
                this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                this.ctx.rotate(this.angle);
                this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.ctx.restore();
                break;
    
            default:
                this.ctx.save();
                this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                this.ctx.rotate(this.angle);
                this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.ctx.restore();
                break;
        }
    }
    
}