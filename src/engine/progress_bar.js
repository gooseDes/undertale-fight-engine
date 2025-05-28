export class ProgressBar {
    constructor(app, canvas, width, height, x, y) {
        this.app = app;
        this.canvas = canvas;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.value = 1;
        this.actualValue = 1;
        this.min = 0;
        this.max = 100;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.background = new PIXI.Graphics();
        this.container.addChild(this.background);
        this.fill = new PIXI.Graphics();
        this.container.addChild(this.fill);
        this.text = new PIXI.Text('', {
            fontFamily: 'undertale',
            fontSize: height,
            fill: 0xffffff,
            align: 'center',
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);
        this.container.position.set(this.x, this.y);
    }

    update(dt) {
        this.actualValue += (this.value - this.actualValue) * dt * 8;
    }
    drawCutRect(gfx, x, y, width, height, cut, color) {
        gfx.beginFill(color);
        gfx.drawRect(x + cut, y + cut, width - cut * 2, height - cut * 2);
        gfx.drawRect(x + cut, y, width - cut * 2, cut);
        gfx.drawRect(x + cut, y + height - cut, width - cut * 2, cut);
        gfx.drawRect(x, y + cut, cut, height - cut * 2);
        gfx.drawRect(x + width - cut, y + cut, cut, height - cut * 2);
        gfx.endFill();
    }


    draw() {
        const roundedValue = Math.round(this.value * this.max);
        
        const cut = this.height * 0.1;
        this.background.clear();
        this.fill.clear();

        this.drawCutRect(this.background, 0, 0, this.width, this.height, cut, 0xff0000);

        this.drawCutRect(this.fill, 0, 0, this.width * this.actualValue, this.height, cut, 0xeeee00);

        this.text.text = roundedValue;
        this.text.x = this.width / 2;
        this.text.y = this.height / 2;
    }
}