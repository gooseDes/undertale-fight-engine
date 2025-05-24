import { Blaster } from "/src/enemies/blaster.js";
import { CanvasGL } from "/src/engine/canvasGL.js";
import { Character } from "/src/character.js";
import { DialogText } from "/src/dialog_text.js";
import { Enemy } from "/src/enemies/enemy.js";
import { Field } from "/src/field.js";
import { to_draw, to_update, lua_runtime, global, startMod, loadCharacter, mod } from "/src/global.js";
import * as GLOBAL from "/src/global.js";
import { Particle } from "/src/particle.js";
import { ProgressBar } from "/src/engine/progress_bar.js";
import { Soul } from "/src/soul.js";
import { Sprite } from "/src/engine/sprite.js";

const content = document.getElementById('content');
const canvas = document.getElementById('canvas');
const ctx = new CanvasGL(canvas);
const width = content.clientWidth;
const height = content.clientHeight;
canvas.width = width;
canvas.height = height;
ctx.resize(width, height);
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

global.angleTarget = 0;
global.previousAttack = -1;
var angle = 0;

await startMod(0)

let character = await loadCharacter(GLOBAL.characters[0]);

const totskiy_face = new Sprite(canvas, ctx, `/mods/${mod.name}/characters/${GLOBAL.characters[0]}/face.png`, width * 0.07, null, character.parts.face.offsetX * width, character.parts.face.offsetY * height);
const totskiy_body = new Sprite(canvas, ctx, `/mods/${mod.name}/characters/${GLOBAL.characters[0]}/body.png`, width * 0.1, null, character.parts.body.offsetX * width, character.parts.body.offsetY * height);
const totskiy_legs = new Sprite(canvas, ctx, `/mods/${mod.name}/characters/${GLOBAL.characters[0]}/legs.png`, width * 0.1, null, character.parts.legs.offsetX * width, character.parts.legs.offsetY * height);

var totskiy = new Character(canvas, ctx, totskiy_face, totskiy_body, totskiy_legs, width * 0.1, height * 0.1, width / 2, height * 0.08);

const dialog = new DialogText(canvas, ctx, width, height, 0, 0);
var field = new Field(canvas, ctx, dialog, totskiy);
var soul = new Soul(canvas, ctx, keys, joystick, field);
var particles = [];
for (let i = 0; i < 15; i++) {
    particles.push(new Particle(canvas, ctx, 'bg', Math.random() * 10 + 25, width * (0.005 + Math.random() * 0.005), width / 15 * i + Math.random() * width / 10, height + Math.random() * height / 10));
}
soul.x = width * 0.5;
soul.y = height * 0.6;
field.defaultOffsetY = height * 0.07;
field.addSoul(soul);

document.getElementById('confirm-btn').addEventListener('click', () => {
    soul.confirmSelection();
});

const fight_button = new Sprite(canvas, ctx, "assets/images/fight.png", null, height * 0.1, width * 0.05, height * 0.85);
const act_button = new Sprite(canvas, ctx, "assets/images/act.png", null, height * 0.1, width * 0.3, height * 0.85);
const item_button = new Sprite(canvas, ctx, "assets/images/item.png", null, height * 0.1, width * 0.55, height * 0.85);
const mercy_button = new Sprite(canvas, ctx, "assets/images/mercy.png", null, height * 0.1, width * 0.8, height * 0.85);

const hp_bar = new ProgressBar(canvas, ctx, width * 0.15, height * 0.06, width * 0.5 - width * 0.15 * 0.5, height * 0.77);
hp_bar.value = 1;
hp_bar.max = 20;

var dt = 0;

lua_runtime.register('log', (message) => {
    console.log("[lua] " + message);
});

lua_runtime.registerObject('soul', soul);
lua_runtime.registerObject('field', field);
lua_runtime.registerObject('window', window);
lua_runtime.registerObject('global', {});
lua_runtime.register('canvas', canvas);

lua_runtime.register('createEnemy', (type, x, y, w, h) => {
    var enemy = new Enemy(canvas, ctx, type, x * width, y * height, w * width, h * width);
    field.addEnemy(enemy);
    return enemy;
});

lua_runtime.register('createBlaster', (x, y, w, direction) => {
    const blaster = new Blaster(canvas, ctx, 'default');
    blaster.setAttackPlace(x * width, y * height, w * width, direction * Math.PI / 180);
    field.addEnemy(blaster);
    return blaster;
});

lua_runtime.register('getWindowWidth', () => {
    return width;
});

lua_runtime.register('getWindowHeight', () => {
    return height;
});

lua_runtime.register('getDeltaTime', () => {
    return dt;
});

lua_runtime.register('getTime', () => {
    return performance.now() / 1000;
})

lua_runtime.register('hideButtons', () => {
    fight_button.opacity = 0;
    act_button.opacity = 0;
    item_button.opacity = 0;
    mercy_button.opacity = 0;
});

lua_runtime.register('showButtons', () => {
    fight_button.opacity = 1;
    act_button.opacity = 1;
    item_button.opacity = 1;
    mercy_button.opacity = 1;
});

lua_runtime.register('setFieldSize', (w, h) => {
    field.width = w * width;
    field.height = h * height;
});

lua_runtime.register('setFieldWidth', (w) => {
    field.width = w * width;
});

lua_runtime.register('setFieldHeight', (h) => {
    field.height = h * height;
})

lua_runtime.register('setScreenRotation', (angle) => {
    global.angleTarget = angle;
});

lua_runtime.register('setSoulPosition', (x, y) => {
    soul.x = x * width;
    soul.y = y * height;
});

lua_runtime.register('rand', (min, max) => {
    if (min == undefined) {
        return Math.random();
    } else if (max == undefined) {
        return Math.random() * min;
    } else {
        return Math.random() * (max - min) + min;
    }
});

lua_runtime.register('random', () => {
    return Math.random();
})

lua_runtime.register('round', (value) => {
    return Math.round(value);
})

lua_runtime.run(`math.randomseed(os.time())`);

let lastTime = performance.now();

const fpsCounter = document.getElementById('fps-counter');
var fpses = [];

ctx.setChromaticAberration(false);

function update(currentTime) {
    dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    fpses.push(1 / dt);
    if (fpses.length > 10) {
        fpsCounter.textContent = "FPS: " + Math.round(fpses.reduce((sum, val) => sum + val, 0) / fpses.length);
        fpses = [];
    }
    requestAnimationFrame(update);

    if (!dt) return;

    ctx.aberrationStrength += (0 - ctx.aberrationStrength) * dt * 2;

    particles.forEach((particle) => {
        particle.update(dt);
        particle.draw();
    });

    totskiy.update(dt);
    totskiy.draw();

    fight_button.update(dt);
    act_button.update(dt);
    item_button.update(dt);
    mercy_button.update(dt);
    fight_button.draw();
    act_button.draw();
    item_button.draw();
    mercy_button.draw();

    hp_bar.value = soul.hp / 20;
    hp_bar.update(dt);
    hp_bar.draw();

    field.update(dt);
    field.draw();

    soul.update(dt);
    soul.draw();

    dialog.width = field.actualWidth - width * 0.08;
    dialog.height = field.actualHeight - width * 0.08;
    dialog.x = width * 0.5 - dialog.width / 2 + field.offsetX;
    dialog.y = height * 0.5 - dialog.height / 2 + field.offsetY;
    dialog.update(dt);
    dialog.draw();

    to_update.forEach((item) => {
        item.update(dt);
    });

    to_draw.forEach((item) => {
        item.draw();
    });

    totskiy.x = width * 0.5 + field.currentOffsetX;
    totskiy.y = height * 0.15 + field.currentOffsetY - field.actualHeight * 0.5;

    if (global.angleTarget != angle) {
        angle += (global.angleTarget - angle) * dt * 8;
        canvas.style.transform = `rotate(${angle}deg)`;
    }
}

update();