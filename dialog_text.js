export class DialogText {
    constructor(canvas, width, height, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = '';
        this.actualText = '';
        this.textProgress = 0;
        this.progressReached = -1;
    }

    reset() {
        this.text = '';
        this.actualText = '';
        this.textProgress = 0;
        this.progressReached = -1;
    }

    update(dt) {
        if (this.textProgress < this.text.length) {
            if (this.progressReached != Math.floor(this.textProgress)) {
                this.actualText = this.actualText.concat(this.text[Math.floor(this.textProgress)]);
                this.progressReached = Math.floor(this.textProgress);
            }
            this.textProgress += dt * 20;
        }
    }

    draw() {
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.font = `${this.w*0.03}px undertale`;
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(this.actualText, this.x, this.y);
    }
}