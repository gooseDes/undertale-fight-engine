import { Enemy } from "./enemy.js";

export class Field {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        console.log(this.w, this.h);
        this.width = this.w * 0.5;
        this.height = this.w * 0.2;
        this.lineWidth = this.w * 0.01;
        this.offsetX = 0;
        this.offsetY = 0;
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.enemies = [];
        this.action = -1;
        this.soul = null;
        this.sinceDodgingStarted = 0;
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
            case 0:
                this.soul.state = 'dodging';
                for (let i = 0; i < 30; i++) {
                    var enemy = new Enemy(canvas, 'bone', this.w*(1 + i*0.1), (this.h / 2 + this.h * ((Math.random())*0.25))*Math.round(Math.random()), this.w * 0.01, this.h * 0.5);
                    enemy.setMovement(-0.3 - (i*0.005), (Math.random()-0.5)*0.01);
                    this.addEnemy(enemy);
                }
                break;
        }
    }

    update(dt) {
        var any_on_screen = false;
        this.enemies.forEach((enemy) => {
            if (enemy.x > 0) {
                any_on_screen = true;
            }
            enemy.update(dt);
        })
        if (!any_on_screen) {
            this.action = -1;
            this.soul.state = 'action_select';
            this.enemies = [];
        }
        switch (this.action) {
            case 0:
                this.sinceDodgingStarted += dt;
                this.currentOffsetX = Math.sin(this.sinceDodgingStarted*0.5) * this.w * 0.1
                break;
            default:
                this.sinceDodgingStarted = 0;
                this.currentOffsetX += (this.offsetX - this.currentOffsetX) * dt * 8;
                this.currentOffsetY += (this.offsetY - this.currentOffsetY) * dt * 8;
                break;
        }
    }

    draw() {
        this.enemies.forEach((enemy) => {
            enemy.draw();
        })
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeRect(this.w*0.5 - this.width*0.5 + this.currentOffsetX, this.h*0.5 - this.height*0.5 + this.currentOffsetY, this.width, this.height);
    }
}