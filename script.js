import { Character } from "./character.js";
import { Field } from "./field.js";
import { Particle } from "./particle.js";
import { Soul } from "./soul.js";
import { Sprite } from "./sprite.js";

const content = document.getElementById('content');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = content.clientWidth;
const height = canvas.height = content.clientHeight;
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

var field = new Field(canvas);
var soul = new Soul(canvas, keys, field);
var particles = [];
for (let i = 0; i < 10; i++) {
  particles.push(new Particle(canvas, 'bg', Math.random()*10+25, width*(0.005+Math.random()*0.005), width/10*i + Math.random()*width/10, height + Math.random() * height/10))
}
soul.x = width * 0.5;
soul.y = height * 0.6;
field.offsetY = height*0.1;

const totskiy_face = new Sprite(canvas, "assets/images/totskiy_face.png", width*0.1, height*0.1, 10, 10);
const totskiy_body = new Sprite(canvas, "assets/images/totskiy_body.png", width*0.1, height*0.1, 10, 60);
const totskiy_legs = new Sprite(canvas, "assets/images/totskiy_legs.png", width*0.1, height*0.1, 10, 125);

const fight_button = new Sprite(canvas, "assets/images/fight.png", width*0.15, height*0.1, width*0.05, height*0.85);
const act_button = new Sprite(canvas, "assets/images/act.png", width*0.15, height*0.1, width*0.3, height*0.85);
const item_button = new Sprite(canvas, "assets/images/item.png", width*0.15, height*0.1, width*0.55, height*0.85);
const mercy_button = new Sprite(canvas, "assets/images/mercy.png", width*0.15, height*0.1, width*0.8, height*0.85);

var totskiy = new Character(canvas, totskiy_face, totskiy_body, totskiy_legs, width*0.1, height*0.1, width/2, height*0.1);

let lastTime = performance.now();

function update(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    requestAnimationFrame(update);

    if (!dt) return;

    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, width, height);
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.update(dt);
      particle.draw();
    })

    soul.update(dt);
    soul.draw();

    field.update(dt);
    field.draw();

    totskiy.update();
    totskiy.draw();

    fight_button.draw();
    act_button.draw();
    item_button.draw();
    mercy_button.draw();
}

update();