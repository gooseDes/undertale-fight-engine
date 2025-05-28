export class Sprite {
    constructor(app, imagePath, width = null, height = null, x = 0, y = 0) {
        this.app = app;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.actualOpacity = 1;

        this.width = width;
        this.height = height;

        this.sprite = null;

        this.load();
    }

    async load() {
        const texture = await PIXI.Assets.load(this.imagePath);
        this.sprite = new PIXI.PixiSprite(texture);

        const aspect = texture.width / texture.height;

        if (this.width && !this.height) {
            this.sprite.width = this.width;
            this.sprite.height = this.width / aspect;
        } else if (!this.width && this.height) {
            this.sprite.height = this.height;
            this.sprite.width = this.height * aspect;
        } else if (!this.width && !this.height) {
            this.sprite.width = texture.width;
            this.sprite.height = texture.height;
        } else {
            this.sprite.width = this.width;
            this.sprite.height = this.height;
        }

        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.alpha = this.actualOpacity;

        this.app.stage.addChild(this.sprite);
    }

    update(dt) {
        if (!this.sprite) return;
        this.actualOpacity += (this.opacity - this.actualOpacity) * dt * 8;
        this.sprite.alpha = this.actualOpacity;
    }

    draw() {}
}