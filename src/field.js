import * as dialogs from "/src/dialogs.js";
import { global, lua_runtime, mod } from "/src/global.js";
import { loadFile } from "/src/engine/lua.js";


export class Field {
    constructor(app, canvas, dialog, character) {
        this.app = app;
        this.canvas = canvas;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.width = this.w * 0.5;
        this.height = this.w * 0.2;
        this.actualWidth = 0;
        this.actualHeight = 0;
        this.lineWidth = this.w * 0.01;
        this.offsetX = 0;
        this.offsetY = 0;
        this.defaultOffsetX = 0;
        this.defaultOffsetY = 0;
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
        this.autoCurrentOffsetControl = false;
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
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
                let attacks = [];
                fetch(`/mods/${mod.name}/attacks/attacks.txt`)
                  .then(res => res.text())
                  .then(text => {
                    const lines = text.split('\n');
                    for (const line of lines) {
                        attacks.push(line.trim());
                    }
                  
                    var attack_id = String(Math.round(Math.random()*(attacks.length-1)));
                    while (attack_id == global.previousAttackId) {
                        attack_id = String(Math.round(Math.random()*(attacks.length-1)));
                    }
                    var attack_name = attacks[attack_id];
                    global.previousAttackId = attack_name;
                    this.isLoaded = false;
                    this.currentUpdateLua = '';
                    loadFile(`/mods/${mod.name}/attacks/` + attack_name + "/init.lua").then((code) => {
                        if (code != 'no') {
                            lua_runtime.run(code);
                        }
                        loadFile(`/mods/${mod.name}/attacks/` + attack_name + "/update.lua").then((code) => {
                            if (code != 'no') {
                                this.currentUpdateLua = code;
                                lua_runtime.run(code);
                            } else {
                                this.currentUpdateLua = 'log("no update")';
                            }
                            this.isLoaded = true;
                        });
                    });
                });
                break;
        }
    }

    actionChanged() {
        switch (this.action) {
            case 0:
                this.dialog.text = "* " + dialogs.messages[Math.round(Math.random()*dialogs.messages.length)];
                lua_runtime.run(`showButtons()`);
                global.angleTarget = 0;
                this.autoCurrentOffsetControl = false;
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
            const halfW = enemy.width / 2;
            const halfH = enemy.height / 2;
            if (
                enemy.x + halfW > 0 &&
                enemy.x - halfW < this.w &&
                enemy.y + halfH > 0 &&
                enemy.y - halfH < this.h &&
                enemy.type != 'blaster' &&
                enemy.constructor.name != 'Blaster'
            ) {
                any_on_screen = true;
            }
        });
        switch (this.action) {
            case -1:
                this.sinceDodgingStarted += dt;
                this.dialog.reset();
                if (this.isLoaded) {
                    lua_runtime.run(this.currentUpdateLua);
                    if (!any_on_screen && this.enemiesWasOnScreen && this.sinceDodgingStarted > 1) {
                        this.action = 0;
                        this.soul.state = 'action_selection';
                        this.clear();
                    }
                    if (this.autoCurrentOffsetControl) {
                        this.currentOffsetX += (this.offsetX - this.currentOffsetX) * dt * 8;
                        this.currentOffsetY += (this.offsetY - this.currentOffsetY) * dt * 8;
                    }
                }
                break;
            default:
                this.sinceDodgingStarted = 0;
                this.offsetX = this.defaultOffsetX;
                this.offsetY = this.defaultOffsetY;
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
        });
        this.graphics.clear();
        this.graphics.rect(this.w*0.5 - this.actualWidth*0.5 + this.currentOffsetX, this.h*0.5 - this.actualHeight*0.5 + this.currentOffsetY, this.actualWidth, this.actualHeight);
        this.graphics.stroke({ width: this.lineWidth, color: 0xffffff })
    }

    clear() {
        this.enemies.forEach((enemy) => {
            enemy.destroy();
        })
    }
}
