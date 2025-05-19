function isCollidingWithRotatedRect(soul, enemy) {
    const sx = soul.x + soul.width / 2;
    const sy = soul.y + soul.height / 2;
    const radius = Math.max(soul.width, soul.height) / 4;

    const cx = enemy.x;
    const cy = enemy.y;
    const angle = enemy.angle || 0;

    const dx = sx - cx;
    const dy = sy - cy;
    const localX = Math.cos(-angle) * dx - Math.sin(-angle) * dy;
    const localY = Math.sin(-angle) * dx + Math.cos(-angle) * dy;

    const ex = Math.max(-enemy.width / 2, Math.min(localX, enemy.width / 2));
    const ey = Math.max(-enemy.height / 2, Math.min(localY, enemy.height / 2));

    const distSq = (localX - ex) ** 2 + (localY - ey) ** 2;
    return distSq < radius * radius;
}

export class Soul {
    constructor(canvas, ctx, keys, joystick, field) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.w = canvas.clientWidth;
        this.h = canvas.clientHeight;
        this.size = this.w * 0.003;
        this.speed = this.w * 0.2;
        this.keys = keys;
        this.prevKeys = {};
        this.field = field;
        this.x = 0;
        this.y = 0;
        this.width = this.size * 10;
        this.height = this.size * 10;
        this.oldFieldOffsetX = this.field.currentOffsetX;
        this.oldFieldOffsetY = this.field.currentOffsetY;
        this.joystickAngle = null;
        this.prevJoystickAngle = null;
        this.joystickDistance = 0;
        this.state = 'action_selection';
        this.actionSelection = 0;
        this.maxActionSelection = 4;
        this.hp = 20;
        this.shadowsAmount = 8;
        this.shadows = [];
        for (let i = 0; i < this.shadowsAmount; i++) {
            this.shadows.push({
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                opacity: 0.1 - (i / this.shadowsAmount) * 0.1
            });
        }

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
                this.joystickDistance = data.distance / 50;
            });
            joystick.on('end', () => {
                this.joystickAngle = null;
                this.joystickDistance = 0;
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

    isDirectionJustPressed(direction) {
        switch (direction) {
            case 'up':
                return (this.keys['KeyW'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 90) < 60 && this.joystickAngle)) && (!this.prevKeys['KeyW'] && !this.prevJoystickAngle);
            case 'down':
                return (this.keys['KeyS'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 270) < 60 && this.joystickAngle)) && (!this.prevKeys['KeyS'] && !this.prevJoystickAngle);
            case 'left':
                return (this.keys['KeyA'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 180) < 60 && this.joystickAngle)) && (!this.prevKeys['KeyA'] && !this.prevJoystickAngle);
            case 'right':
                return (this.keys['KeyD'] || (Math.abs(this.joystickAngle * (180 / Math.PI) - 0) < 60 && this.joystickAngle)) && (!this.prevKeys['KeyD'] && !this.prevJoystickAngle);
            default:
                return false;
        }
    }

    isConfirmJustPressed() {
        return this.keys['Enter'] && !this.prevKeys['Enter'];
    }

    update(dt) {
        this.width = this.size * 9;
        this.height = this.size * 9;
        for (let i = 0; i < this.shadowsAmount; i++) {
            this.shadows[i].x += (this.x - this.shadows[i].x) * dt * (i+2)*9;
            this.shadows[i].y += (this.y - this.shadows[i].y) * dt * (i+2)*9;
        }

        switch (this.state) {
            case 'action_selection':
                const heart_positions = [0.11, 0.37, 0.615, 0.87];
                this.x += ((heart_positions[this.actionSelection] * this.w) - this.x) * dt * 12;
                this.y += ((this.h * 0.8 + (Math.sin(performance.now() * 0.01) * this.h * 0.01)) - this.y) * dt * 12;

                if (this.isDirectionJustPressed('right')) {
                    this.actionSelection += 1;
                }

                if (this.isDirectionJustPressed('left')) {
                    this.actionSelection -= 1;
                }

                if (this.actionSelection >= this.maxActionSelection) {
                    this.actionSelection = 0;
                } else if (this.actionSelection < 0) {
                    this.actionSelection = this.maxActionSelection-1;
                }

                if (this.isConfirmJustPressed()) {
                    this.confirmSelection();
                }
                break;

            case 'target_selection':
                this.x = this.w*0.5 - this.field.width*0.5 + this.field.currentOffsetX + this.width*0.4;
                this.y = this.h*0.5 - this.field.height*0.5 + this.field.currentOffsetY + this.height*1.75 + this.height*this.actionSelection;

                if (this.isDirectionJustPressed('up')) {
                    this.actionSelection -= 1;
                }

                if (this.isDirectionJustPressed('down')) {
                    this.actionSelection += 1;
                }

                if (this.actionSelection >= this.maxActionSelection) {
                    this.actionSelection = 0;
                } else if (this.actionSelection < 0) {
                    this.actionSelection = this.maxActionSelection-1;
                }

                if (this.isConfirmJustPressed()) {
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

                this.shadows.forEach((shadow) => {
                    shadow.x += this.field.currentOffsetX - this.oldFieldOffsetX;
                    shadow.y += this.field.currentOffsetY - this.oldFieldOffsetY;
                })

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
                    this.x += Math.cos(this.joystickAngle) * this.speed * this.joystickDistance * dt;
                    this.y -= Math.sin(this.joystickAngle) * this.speed * this.joystickDistance * dt;
                }

                this.field.enemies.forEach(enemy => {
                    if (isCollidingWithRotatedRect(this, enemy)) {
                        console.log('Collision detected!');
                        const damage = dt * 20 * enemy.damage * enemy.opacity;
                        this.hp -= damage;
                        this.ctx.setChromaticAberration(true, damage);
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
                break;
        }
        this.prevKeys = { ...this.keys };
        this.prevJoystickAngle = this.joystickAngle;
    }

    draw() {
        this.ctx.fillStyle = '#ff0000';
        this.shadows.forEach((shadow) => {
            this.ctx.globalAlpha = shadow.opacity;
            for (let y = 0; y < this.heart.length; y++) {
                for (let x = 0; x < this.heart[y].length; x++) {
                    if (this.heart[y][x]) {
                        this.ctx.fillRect(x * this.size + shadow.x, y * this.size + shadow.y, this.size + 1, this.size + 1);
                    }
                }
            }
        });
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#ff0000';
        for (let y = 0; y < this.heart.length; y++) {
            for (let x = 0; x < this.heart[y].length; x++) {
                if (this.heart[y][x]) {
                    this.ctx.fillRect(x * this.size + this.x, y * this.size + this.y, this.size + 1, this.size + 1);
                }
            }
        }
    }
}
