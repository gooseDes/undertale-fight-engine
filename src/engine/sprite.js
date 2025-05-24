export class Sprite {
    constructor(canvas, ctx, imagePath, width = null, height = null, x = 0, y = 0) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.imagePath = imagePath;
        this.image = new Image();
        this.image.src = this.imagePath;

        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.actualOpacity = 1;

        this.image.onload = () => {
            const aspect = this.image.width / this.image.height;

            if (width && !height) {
                this.width = width;
                this.height = width / aspect;
            } else if (!width && height) {
                this.height = height;
                this.width = height * aspect;
            } else if (!width && !height) {
                this.width = this.image.width;
                this.height = this.image.height;
            } else {
                this.width = width;
                this.height = height;
            }
        };
    }

    update(dt) {
        this.actualOpacity += (this.opacity - this.actualOpacity) * dt * 8;
    }

    draw() {
        if (!this.image.complete) return;

        this.ctx.save();
        this.ctx.globalAlpha = this.actualOpacity;
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
}