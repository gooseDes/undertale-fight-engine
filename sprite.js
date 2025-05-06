export class Sprite {
    constructor(canvas, image, width, height, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.imagePath = image;
        this.image = new Image()
        this.image.src = this.imagePath;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.actualOpacity = 1;
    }
    update(dt) {
        this.actualOpacity += (this.opacity - this.actualOpacity) * dt * 8;
    }
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.actualOpacity;
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.ctx.restore();
    }
}