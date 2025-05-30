import { Enemy } from "/src/enemies/enemy.js";

export class Blaster extends Enemy {
    constructor(app, canvas, type) {
        super(app, canvas, type, 0, 0, 0, 0);
        this.attackPlaceX = 0;
        this.attackPlaceY = 0;
        this.attackPlaceWidth = 0;
        this.attackPlaceDirection = 0;
        this.isShooted = false;
        this.opacity = 1;
        this.damage = 0.1;
        this.load();
    }

    async load() {
        const texture = await PIXI.Assets.load("assets/images/blaster.png");
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.rotation = 0;
        this.sprite.width *= 2;
        this.sprite.height *= 2;
        this.sprite.alpha = this.opacity;
        this.app.stage.addChild(this.sprite);
    }

    setAttackPlace(x, y, width, direction) {
        this.attackPlaceX = x;
        this.attackPlaceY = y;
        this.attackPlaceWidth = width;
        this.attackPlaceDirection = direction-Math.PI*0.5;
    }

    shoot(dt) {
        const enemy = new Enemy(
            this.app,
            this.canvas,
            'blaster',
            this.attackPlaceX,
            this.attackPlaceY - this.sprite.height / 2,
            this.sprite.height,
            this.attackPlaceWidth
        );
        enemy.angle = this.angle+Math.PI*0.5;
        this.field.addEnemy(enemy);
        enemy.update(dt);
        if (enemy.draw) enemy.draw();
        this.isShooted = true;
        this.isStarted = false;
        this.isStartingStarted = false;
    }

    update(dt) {
        if (!this.sprite) return;
        this.sprite.x += (this.attackPlaceX - this.sprite.x) * dt * 8;
        this.sprite.y += (this.attackPlaceY - this.sprite.y) * dt * 8;

        if (this.oldFieldOffsetX != this.field.currentOffsetX) {
            this.attackPlaceX += this.field.currentOffsetX - this.oldFieldOffsetX;
        }
        if (this.oldFieldOffsetY != this.field.currentOffsetY) {
            this.attackPlaceY += this.field.currentOffsetY - this.oldFieldOffsetY;
        }

        this.oldFieldOffsetX = this.field.currentOffsetX;
        this.oldFieldOffsetY = this.field.currentOffsetY;

        const newSize = this.attackPlaceWidth;
        const currentSize = this.sprite.width;
        const sizeLerp = currentSize + (newSize - currentSize) * dt * 8;
        this.sprite.width = sizeLerp;
        this.sprite.height = sizeLerp;

        this.sprite.rotation += (this.attackPlaceDirection - this.sprite.rotation) * dt * 8;

        if (
            Math.abs(this.sprite.rotation - this.attackPlaceDirection) < 0.1 &&
            Math.abs(this.sprite.x - this.attackPlaceX) < this.app.renderer.width * 0.01 &&
            Math.abs(this.sprite.y - this.attackPlaceY) < this.app.renderer.width * 0.01 &&
            Math.abs(this.sprite.width - this.attackPlaceWidth) < this.app.renderer.width * 0.01
        ) {
            if (!this.isStartingStarted) {
                this.isStartingStarted = true;
                setTimeout(() => {
                    this.isStarted = true;
                }, 500);
            }

            if (this.isStarted) {
                this.opacity -= dt;
                this.sprite.alpha = this.opacity;

                if (!this.isShooted) this.shoot(dt);

                if (this.opacity < 0) {
                    this.destroy();
                }
            }
        }
    }

    draw() {}

    destroy() {
        super.destroy();
        this.app.stage.removeChild(this.sprite);
    }
}
