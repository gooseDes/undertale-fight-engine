export class Soul {
    constructor(canvas, keys, field) {
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
        this.width = this.size*10;
        this.height = this.size*10;
        this.oldFieldOffsetX = this.field.offsetX;
        this.oldFieldOffsetY = this.field.offsetY;

        this.heart = [
        [0,1,1,0,0,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0]
        ];
    }

    update(dt) {
        this.width = this.size*10;
        this.height = this.size*10;

        if (this.oldFieldOffsetX != this.field.offsetX) {
            this.x += this.field.offsetX - this.oldFieldOffsetX;
        }
        if (this.oldFieldOffsetY != this.field.offsetY) {
            this.y += this.field.offsetY - this.oldFieldOffsetY;
        }

        this.oldFieldOffsetX = this.field.offsetX;
        this.oldFieldOffsetY = this.field.offsetY;

        if (this.keys['KeyW']) {
            this.y -= this.speed*dt;
        }
        if (this.keys['KeyS']) {
            this.y += this.speed*dt;
        }
        if (this.keys['KeyA']) {
            this.x -= this.speed*dt;
        }
        if (this.keys['KeyD']) {
            this.x += this.speed*dt;
        }
        if (this.x >= (this.w/2 + this.field.width/2 - this.width + this.field.offsetX)) {
            this.x = this.w/2 + this.field.width/2 - this.width + this.field.offsetX;
        }
        if (this.y >= (this.h/2 + this.field.height/2 - this.height) + this.field.offsetY) {
            this.y = this.h/2 + this.field.height/2 - this.height + this.field.offsetY;
        }
        if (this.x <= (this.w/2 - this.field.width/2 + this.width*0.2) + this.field.offsetX) {
            this.x = this.w/2 - this.field.width/2 + this.width*0.2 + this.field.offsetX;
        }
        if (this.y <= (this.h/2 - this.field.height/2 + this.height/2 + this.field.offsetY)) {
            this.y = this.h/2 - this.field.height/2 + this.height/2 + this.field.offsetY;
        }
    }

    draw() {
        this.ctx.fillStyle = 'red';
        for (let y = 0; y < this.heart.length; y++) {
            for (let x = 0; x < this.heart[y].length; x++) {
                if (this.heart[y][x]) {
                    this.ctx.fillRect(x * this.size + this.x, y * this.size + this.y, this.size, this.size);
                }
            }
        }
    }
}