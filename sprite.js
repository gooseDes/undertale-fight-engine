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
    }
    update(dt) {

    }
    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}