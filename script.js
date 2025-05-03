import { Character } from "./character.js";
import { DialogText } from "./dialog_text.js";
import { Field } from "./field.js";
import { to_draw, to_update } from "./global.js";
import { Particle } from "./particle.js";
import { ProgressBar } from "./progress_bar.js";
import { Soul } from "./soul.js";
import { Sprite } from "./sprite.js";

const content = document.getElementById('content');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = content.clientWidth;
const height = canvas.height = content.clientHeight;
const keys = {};

const music = new Audio("assets/sounds/music.mp3");
music.play();

var joystick = null;

if ('ontouchstart' in window) {
  joystick = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: "static",
    position: { left: "12svh", bottom: "12svh" },
    color: "linear-gradient(135deg, #ff0000, #ff7700)",
  });
  document.getElementById('confirm-btn').style.display = 'block';
}

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

const totskiy_face = new Sprite(canvas, "assets/images/totskiy/face.png", width * 0.07, height * 0.12, 0, height*0.01);
const totskiy_body = new Sprite(canvas, "assets/images/totskiy/body.png", width * 0.1, height * 0.1, 0, 0);
const totskiy_legs = new Sprite(canvas, "assets/images/totskiy/legs.png", width * 0.1, height * 0.1, 0, 0);

var totskiy = new Character(canvas, totskiy_face, totskiy_body, totskiy_legs, width * 0.1, height * 0.1, width / 2, height * 0.08);

const dialog = new DialogText(canvas, width, height, 0, 0);
var field = new Field(canvas, dialog, totskiy);
var soul = new Soul(canvas, keys, joystick, field);
var particles = [];
for (let i = 0; i < 15; i++) {
  particles.push(new Particle(canvas, 'bg', Math.random() * 10 + 25, width * (0.005 + Math.random() * 0.005), width / 15 * i + Math.random() * width / 10, height + Math.random() * height / 10));
}
soul.x = width * 0.5;
soul.y = height * 0.6;
field.offsetY = height * 0.07;
field.addSoul(soul);

document.getElementById('confirm-btn').addEventListener('click', () => {
    soul.confirmSelection();
});

const fight_button = new Sprite(canvas, "assets/images/fight.png", width * 0.15, height * 0.1, width * 0.05, height * 0.85);
const act_button = new Sprite(canvas, "assets/images/act.png", width * 0.15, height * 0.1, width * 0.3, height * 0.85);
const item_button = new Sprite(canvas, "assets/images/item.png", width * 0.15, height * 0.1, width * 0.55, height * 0.85);
const mercy_button = new Sprite(canvas, "assets/images/mercy.png", width * 0.15, height * 0.1, width * 0.8, height * 0.85);

const hp_bar = new ProgressBar(canvas, width*0.15, height*0.06, width*0.5-width*0.15*0.5, height*0.77);
hp_bar.value = 1;
hp_bar.max = 20;

let lastTime = performance.now();

function update(currentTime) {
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  requestAnimationFrame(update);

  if (!dt) return;

  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.update(dt);
    particle.draw();
  });

  totskiy.update(dt);
  totskiy.draw();

  fight_button.draw();
  act_button.draw();
  item_button.draw();
  mercy_button.draw();
  
  hp_bar.value = soul.hp/20;
  hp_bar.update(dt);
  hp_bar.draw();

  field.update(dt);
  field.draw();

  soul.update(dt);
  soul.draw();

  dialog.width = field.actualWidth - width*0.08;
  dialog.height = field.actualHeight - width*0.08;
  dialog.x = width*0.5 - dialog.width/2 + field.offsetX;
  dialog.y = height*0.5 - dialog.height/2 + field.offsetY;
  dialog.update(dt);
  dialog.draw();

  to_update.forEach((item) => {
    item.update(dt);
  });
  
  to_draw.forEach((item) => {
    item.draw();
  });

  totskiy.x = width * 0.5 + field.currentOffsetX;
  totskiy.y = height * -0.02 + field.currentOffsetY;
}

update();
