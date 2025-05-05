import { Enemy } from "./enemy.js";
import { to_draw, to_update } from "./global.js";

export class Blaster extends Enemy {
    constructor(canvas, type) {
        super(canvas, type, 0, 0, 0, 0);
        this.attackPlaceX = 0;
        this.attackPlaceY = 0;
        this.attackPlaceWidth = 0;
        this.attackPlaceDirection = 0;
        this.isShooted = false;
        this.opacity = 1;
        this.image = new Image()
        this.image.src = "assets/images/blaster.png";
    }

    setAttackPlace(x, y, width, direction) {
        this.attackPlaceX = x;
        this.attackPlaceY = y;
        this.attackPlaceWidth = width;
        this.attackPlaceDirection = direction;
    }

    shoot(dt) {
        const enemy = new Enemy(
            this.canvas,
            'blaster',
            this.x - this.w/2 + this.width/2 + Math.cos(this.angle)*this.w/2,
            this.y - this.height/2 + Math.sin(this.angle)*this.w/2,
            this.w,
            this.attackPlaceWidth
        );
        enemy.angle = this.angle;
        this.field.addEnemy(enemy);
        enemy.update(dt);
        enemy.draw();
        this.isShooted = true;
        this.isStarted = false;
        this.isStartingStarted = false;
    }

    update(dt) {
        this.x += (this.attackPlaceX - this.x) * dt * 8;
        this.y += (this.attackPlaceY - this.y) * dt * 8;
        this.width += (this.attackPlaceWidth - this.width) * dt * 8;
        this.height = this.width;

        this.angle += (this.attackPlaceDirection - this.angle) * dt * 8;

        if (
            Math.abs(this.angle - this.attackPlaceDirection) < 0.1 &&
            Math.abs(this.x - this.attackPlaceX) < 0.1 &&
            Math.abs(this.y - this.attackPlaceY) < 0.1 &&
            Math.abs(this.width - this.attackPlaceWidth) < 0.1
        ) {
            this.isStartingStarted = true;
            setTimeout(() => {
                this.isStarted = true;
            }, 500);
            if (this.isStarted) {
                this.opacity -= dt * 0.5;
                if (this.opacity < 0) {
                    to_update.splice(to_update.indexOf(this), 1);
                    to_draw.splice(to_draw.indexOf(this), 1);
                    this.field.enemies.splice(this.field.enemies.indexOf(this), 1);
                }
                if (!this.isShooted) {
                    this.shoot(dt);
                }
            }
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.rotate(this.angle);

        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height * 2);
        this.ctx.restore();

        this.ctx.restore();
    }
}
