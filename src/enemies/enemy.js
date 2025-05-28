import { to_draw, to_update } from "/src/global.js";

export class Enemy {
    constructor(app, type, x, y, width, height) {
        this.app = app;
        this.type = type;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.speedAngle = 0;
        this.gravityX = 0;
        this.gravityY = 0;
        this.field = null;
        this.oldFieldOffsetX = 0;
        this.oldFieldOffsetY = 0;
        this.opacity = 1;
        this.damage = 1;

        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
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
        if (this.oldFieldOffsetX !== this.field.currentOffsetX) {
            this.x += this.field.currentOffsetX - this.oldFieldOffsetX;
        }
        if (this.oldFieldOffsetY !== this.field.currentOffsetY) {
            this.y += this.field.currentOffsetY - this.oldFieldOffsetY;
        }

        this.oldFieldOffsetX = this.field.currentOffsetX;
        this.oldFieldOffsetY = this.field.currentOffsetY;

        this.speedX += this.gravityX;
        this.speedY += this.gravityY;

        const w = this.app.renderer.width;

        this.x += this.speedX * dt * w;
        this.y += this.speedY * dt * w;
        this.angle += this.speedAngle * dt;

        switch (this.type) {
            case "blaster":
                let grow = dt * w * 10;
                this.width += grow;
                this.x += Math.cos(this.angle) * grow * 0.5;
                this.y += Math.sin(this.angle) * grow * 0.5;

                this.opacity -= dt * 1.5;
                if (this.opacity <= 0) {
                    this.destroy();
                }

                this.damage = 0.5;
                break;
        }
    }

    draw() {
        this.graphics.clear();
        this.graphics.alpha = this.opacity;

        this.graphics.position.set(this.x, this.y);
        this.graphics.rotation = this.angle;

        switch (this.type) {
            case "blaster":
                this.graphics.beginFill(0xffffff);
                this.graphics.drawRect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.graphics.endFill();
                break;
            default:
                this.graphics.beginFill(0xffffff);
                this.graphics.drawRect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.graphics.endFill();
                break;
        }
    }

    destroy() {
        this.app.stage.removeChild(this.graphics);
        this.graphics.destroy();
        to_update.splice(to_update.indexOf(this), 1);
        to_draw.splice(to_draw.indexOf(this), 1);
        this.field.enemies.splice(this.field.enemies.indexOf(this), 1);
    }
}
