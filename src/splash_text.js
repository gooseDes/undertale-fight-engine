import { to_draw, to_update } from "/src/global.js";

export class SplashText {
    constructor(app, canvas, width, height, x, y) {
        this.app = app;
        this.canvas = canvas;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = "";
        this.alpha = 1.0;
        this.speedY = -24;
        this.speedX = 24 * (Math.random() < 0.5 ? -1 : 1);

        const style = new PIXI.TextStyle({
            fontFamily: 'undertale',
            fontSize: app.renderer.width * 0.03,
            fill: '#aaaaaa',
            wordWrap: true,
            wordWrapWidth: this.width,
            lineHeight: app.renderer.width * 0.04,
        });

        this.textObject = new PIXI.Text('', style);
        this.textObject.x = x;
        this.textObject.y = y;
        this.app.stage.addChild(this.textObject);
    }

    update(dt) {
        this.alpha -= dt * 0.5;
        this.x += this.speedX * dt * 10;
        this.y += this.speedY * dt * 10;
        this.speedX *= 0.99;
        this.speedY += 0.3;
        this.textObject.alpha = this.alpha;
        this.textObject.text = this.text;
        this.textObject.x = this.x;
        this.textObject.y = this.y;
        if (this.alpha <= 0) {
            this.alpha = 0;
            to_update.splice(to_update.indexOf(this), 1);
            to_draw.splice(to_draw.indexOf(this), 1);
            this.app.stage.removeChild(this.textObject);
        }
    }

    draw() {}
}