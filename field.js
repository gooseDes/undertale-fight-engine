import * as dialogs from "./dialogs.js";
import { lua_runtime } from "./global.js";
import { loadFile } from "./lua.js";

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
        this.currentUpdateLua = '';
        this.enemiesWasOnScreen = false;
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
                const attack_name = String(Math.round(Math.random()*1));
                //const attack_name = "0";
                loadFile("scripts/attacks/" + attack_name + "/init.lua").then((code) => {
                    if (code != 'no') {
                        lua_runtime.run(code);
                    }
                });
                loadFile("scripts/attacks/" + attack_name + "/update.lua").then((code) => {
                    if (code != 'no') {
                        this.currentUpdateLua = code;
                        lua_runtime.run(code);
                    } else {
                        this.currentUpdateLua = '';
                    }
                });
                break;
        }
    }

    actionChanged() {
        switch (this.action) {
            case 0:
                this.dialog.text = "* " + dialogs.messages[Math.round(Math.random()*dialogs.messages.length)];
                lua_runtime.run(`showButtons()`);
                break;
            case -1:
                this.character.damage();
                break;
        }
        this.actualWidth += this.w*0.1;
        this.actualHeight -= this.h*0.1;
        this.enemiesWasOnScreen = false;
    }

    update(dt) {
        if (this.action != this.oldAction) {
            this.actionChanged();
            this.oldAction = this.action;
        }
        var any_on_screen = false;
        this.enemies.forEach((enemy) => {
            this.enemiesWasOnScreen = true;
            enemy.update(dt);
            if (enemy.x > 0 && enemy.x < this.w && enemy.y > 0 && enemy.y < this.h && enemy.type != 'blaster' && enemy.constructor.name != 'Blaster') {
                any_on_screen = true;
            }
        })
        switch (this.action) {
            case -1:
                this.sinceDodgingStarted += dt;
                this.dialog.reset();
                lua_runtime.run(this.currentUpdateLua);
                if (!any_on_screen && this.enemiesWasOnScreen && this.sinceDodgingStarted > 1) {
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
                this.height = this.w*0.2;
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
