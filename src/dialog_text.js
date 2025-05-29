export class DialogText {
    constructor(app, width, height, x, y) {
        this.app = app;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        this.text = '';
        this.actualText = '';
        this.textProgress = 0;
        this.progressReached = -1;

        const style = new PIXI.TextStyle({
            fontFamily: 'undertale',
            fontSize: app.renderer.width * 0.03,
            fill: 'white',
            wordWrap: true,
            wordWrapWidth: this.width,
            lineHeight: app.renderer.width * 0.04,
        });

        this.textObject = new PIXI.Text('', style);
        this.textObject.x = x;
        this.textObject.y = y;
        this.app.stage.addChild(this.textObject);
    }

    reset() {
        this.text = '';
        this.actualText = '';
        this.textProgress = 0;
        this.progressReached = -1;
        this.textObject.text = '';
    }

    setText(newText) {
        this.reset();
        this.text = newText;
    }

    update(dt) {
        this.textObject.x = this.x;
        this.textObject.y = this.y;
        if (this.textProgress < this.text.length) {
            if (this.progressReached !== Math.floor(this.textProgress)) {
                this.actualText += this.text[Math.floor(this.textProgress)];
                this.progressReached = Math.floor(this.textProgress);
                this.textObject.text = this.wrapText(this.actualText);
            }
            this.textProgress += dt * 20;
        }
    }

    wrapText(text) {
        const words = text.split(' ');
        let line = '';
        let result = '';

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            this.textObject.text = testLine;
            const testWidth = this.textObject.width;

            if (testWidth > this.width && i > 0) {
                result += line + '\n';
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }

        result += line;
        return result;
    }
}
