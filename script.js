import { Field } from "./field.js";
import { Soul } from "./soul.js";

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
soul.x = width * 0.5;
soul.y = height * 0.6;

let lastTime = performance.now();

function update(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, width, height);
    ctx.clearRect(0, 0, width, height);

    soul.update(dt);
    soul.draw();

    field.offsetX = Math.sin(performance.now()*0.001)*width/4;
    field.offsetY = Math.cos(performance.now()*0.001)*height/4;
    field.update(dt);
    field.draw();

    requestAnimationFrame(update);
}

update();