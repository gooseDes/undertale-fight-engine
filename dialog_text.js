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

        const words = this.actualText.split(' ');
        let line = '';
        let y = this.y;
        const lineHeight = this.w * 0.04;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = this.ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > this.width && n > 0) {
                this.ctx.fillText(line, this.x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, this.x, y);
    }
}