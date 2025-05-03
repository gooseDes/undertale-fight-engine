import { Enemy } from "./enemy.js";
import * as dialogs from "./dialogs.js";
import { DialogText } from "./dialog_text.js";

export class Field {
    constructor(canvas, dialog, character) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = this.w * 0.5;
        this.height = this.w * 0.2;
        this.actualWidth = 0;
        this.actualHeight = 0;
        this.lineWidth = this.w * 0.01;
        this.offsetX = 0;
        this.offsetY = 0;
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.enemies = [];
        this.action = 0;
        this.oldAction = null;
        this.soul = null;
        this.sinceDodgingStarted = 0;
        this.dialog = dialog;
        this.character = character;
    }

    addEnemy(enemy) {
        this.enemies.push(enemy);
        enemy.field = this;
    }

    addSoul(soul) {
        this.soul = soul;
    }

    actionSelected(action) {
        this.action = action;
        switch (this.action) {
            case 1:
                this.soul.state = 'target_selection';
                this.dialog.reset();
                this.dialog.text = "* Totskiy";
                this.soul.maxActionSelection = 1;
                break;
            case -1:
                this.soul.state = 'dodging';
                this.soul.maxActionSelection = 4;
                for (let i = 0; i < 30; i++) {
                    var enemy = new Enemy(canvas, 'bone', this.w*(1 + i*0.1), (this.h / 2 + this.h * ((Math.random())*0.25))*Math.round(Math.random()), this.w * 0.01, this.h * 0.5);
                    enemy.setMovement(-0.3 - (i*0.005), (Math.random()-0.5)*0.01);
                    this.addEnemy(enemy);
                }
                break;
        }
    }

    actionChanged() {
        switch (this.action) {
            case 0:
                this.dialog.text = "* " + dialogs.messages[Math.round(Math.random()*dialogs.messages.length)];
                break;
            case -1:
                this.character.damage();
                break;
        }
        this.actualWidth += this.w*0.1;
        this.actualHeight -= this.h*0.1;
    }

    update(dt) {
        if (this.action != this.oldAction) {
            this.actionChanged();
            this.oldAction = this.action;
        }
        var any_on_screen = false;
        this.enemies.forEach((enemy) => {
            if (enemy.x > 0) {
                any_on_screen = true;
            }
            enemy.update(dt);
        })
        switch (this.action) {
            case -1:
                this.sinceDodgingStarted += dt;
                this.currentOffsetX = Math.sin(this.sinceDodgingStarted) * this.w * 0.1
                this.currentOffsetY = Math.cos(this.sinceDodgingStarted*1.1) * this.h * 0.1
                this.width = this.w*0.8;
                this.dialog.reset();
                if (!any_on_screen) {
                    this.action = 0;
                    this.soul.state = 'action_selection';
                    this.enemies = [];
                }
                break;
            default:
                this.sinceDodgingStarted = 0;
                this.currentOffsetX += (this.offsetX - this.currentOffsetX) * dt * 8;
                this.currentOffsetY += (this.offsetY - this.currentOffsetY) * dt * 8;
                this.width = this.w*0.6;
                break;
        }
        this.actualWidth -= (this.actualWidth - this.width) * dt * 8;
        this.actualHeight -= (this.actualHeight - this.height) * dt * 8;
    }

    draw() {
        this.enemies.forEach((enemy) => {
            enemy.draw();
        })
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeRect(this.w*0.5 - this.actualWidth*0.5 + this.currentOffsetX, this.h*0.5 - this.actualHeight*0.5 + this.currentOffsetY, this.actualWidth, this.actualHeight);
    }
}
