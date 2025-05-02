export class Soul {
    constructor(canvas, keys, joystick, field) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.size = this.w * 0.003;
        this.speed = this.w * 0.2;
        this.keys = keys;
        this.field = field;
        this.x = 0;
        this.y = 0;
        this.width = this.size * 10;
        this.height = this.size * 10;
        this.oldFieldOffsetX = this.field.currentOffsetX;
        this.oldFieldOffsetY = this.field.currentOffsetY;
        this.joystickAngle = null;
        this.state = 'action_selection';
        this.actionSelection = 0;
        this.actionSelectionKeyJustPressed = false;
        this.hp = 20;

        this.heart = [
            [0, 1, 1, 0, 0, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        if (joystick) {
            joystick.on('move', (evt, data) => {
                this.joystickAngle = data.angle.radian;
            });
            joystick.on('end', () => {
                this.joystickAngle = null;
            });
        }
    }

    confirmSelection() {
        switch (this.state) {
            case 'action_selection':
                this.field.actionSelected(this.actionSelection+1);
                break;
            case 'target_selection':
                this.field.actionSelected(-1);
                break;
        }
    }

    kill() {
        location.href = location.href;
    }

    update(dt) {
        this.width = this.size * 9;
        this.height = this.size * 9;

        switch (this.state) {
            case 'action_selection':
                const heart_positions = [0.11, 0.37, 0.615, 0.87];
                this.x += ((heart_positions[this.actionSelection] * this.w) - this.x) * dt * 12;
                this.y += ((this.h * 0.8 + (Math.sin(performance.now() * 0.01) * this.h * 0.01)) - this.y) * dt * 12;

                if ((this.keys['KeyD'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 0) < 60 && this.joystickAngle)) && !this.actionSelectionKeyJustPressed) {
                    this.actionSelectionKeyJustPressed = true;
                    this.actionSelection += 1;
                }

                if ((this.keys['KeyA'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 180) < 60 && this.joystickAngle)) && !this.actionSelectionKeyJustPressed) {
                    this.actionSelectionKeyJustPressed = true;
                    this.actionSelection -= 1;
                }

                if (this.actionSelection >= 4) {
                    this.actionSelection = 0;
                } else if (this.actionSelection < 0) {
                    this.actionSelection = 3;
                }

                let pressFound = false;
                Object.keys(this.keys).some(key => {
                    if (this.keys[key]) {
                        pressFound = true;
                        return true;
                    }
                });

                if (!pressFound && this.joystickAngle == null) {
                    this.actionSelectionKeyJustPressed = false;
                }

                if (this.keys['Enter'] && !this.actionSelectionKeyJustPressed) {
                    this.actionSelectionKeyJustPressed = true;
                    this.confirmSelection();
                }

                break;

            case 'target_selection':
                this.x = this.w*0.5 - this.field.width*0.5 + this.field.currentOffsetX + this.width*0.4;
                this.y = this.h*0.5 - this.field.height*0.5 + this.field.currentOffsetY + this.height*1.75 + this.height*this.actionSelection;
                if ((this.keys['KeyS'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 90) < 60 && this.joystickAngle)) && !this.actionSelectionKeyJustPressed) {
                    this.actionSelectionKeyJustPressed = true;
                    this.actionSelection += 1;
                }

                if ((this.keys['KeyW'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 275) < 60 && this.joystickAngle)) && !this.actionSelectionKeyJustPressed) {
                    this.actionSelectionKeyJustPressed = true;
                    this.actionSelection -= 1;
                }

                if (this.actionSelection >= 1) {
                    this.actionSelection = 0;
                } else if (this.actionSelection < 0) {
                    this.actionSelection = 3;
                }

                let pressFoundTarget = false;
                Object.keys(this.keys).some(key => {
                    if (this.keys[key]) {
                        pressFoundTarget = true;
                        return true;
                    }
                });

                if (!pressFoundTarget && this.joystickAngle == null) {
                    this.actionSelectionKeyJustPressed = false;
                }

                if (this.keys['Enter'] && !this.actionSelectionKeyJustPressed) {
                    this.actionSelectionKeyJustPressed = true;
                    this.confirmSelection();
                }
                break;

            case 'dodging':
                if (this.oldFieldOffsetX != this.field.currentOffsetX) {
                    this.x += this.field.currentOffsetX - this.oldFieldOffsetX;
                }
                if (this.oldFieldOffsetY != this.field.currentOffsetY) {
                    this.y += this.field.currentOffsetY - this.oldFieldOffsetY;
                }

                this.oldFieldOffsetX = this.field.currentOffsetX;
                this.oldFieldOffsetY = this.field.currentOffsetY;

                if (this.keys['KeyW']) {
                    this.y -= this.speed * dt;
                }
                if (this.keys['KeyS']) {
                    this.y += this.speed * dt;
                }
                if (this.keys['KeyA']) {
                    this.x -= this.speed * dt;
                }
                if (this.keys['KeyD']) {
                    this.x += this.speed * dt;
                }

                if (this.joystickAngle) {
                    this.x += Math.cos(this.joystickAngle) * this.speed * dt;
                    this.y -= Math.sin(this.joystickAngle) * this.speed * dt;
                }

                this.field.enemies.forEach(enemy => {
                    if ((this.x + this.width >= enemy.x && this.x <= enemy.x + enemy.width) &&
                        (this.y + this.height >= enemy.y && this.y <= enemy.y + enemy.height)) {
                        this.hp -= dt * 12;
                        document.getElementById('hp-bar').textContent = Math.ceil(this.hp);
                        if (this.hp <= 0) {
                            this.kill();
                        }
                    }
                });

                const rightBound = this.w / 2 + this.field.width / 2 - this.width + this.field.currentOffsetX;
                const bottomBound = this.h / 2 + this.field.height / 2 - this.height + this.field.currentOffsetY;
                const leftBound = this.w / 2 - this.field.width / 2 + this.width * 0.2 + this.field.currentOffsetX;
                const topBound = this.h / 2 - this.field.height / 2 + this.height / 2 + this.field.currentOffsetY;

                if (this.x >= rightBound) this.x = rightBound;
                if (this.y >= bottomBound) this.y = bottomBound;
                if (this.x <= leftBound) this.x = leftBound;
                if (this.y <= topBound) this.y = topBound;

                break;

            default:
                return;
        }
    }

    draw() {
        this.ctx.fillStyle = 'red';
        for (let y = 0; y < this.heart.length; y++) {
            for (let x = 0; x < this.heart[y].length; x++) {
                if (this.heart[y][x]) {
                    this.ctx.fillRect(x * this.size + this.x, y * this.size + this.y, this.size + 1, this.size + 1);
                }
            }
        }
    }
}
