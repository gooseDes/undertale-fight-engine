import { LuaRuntime } from "/src/engine/lua.js";

export const to_update = [];
export const to_draw = [];
export const lua_runtime = new LuaRuntime();
export const mods = [];
export var mod = { id: 0, name: '' };
export const characters = [];
export var global = {};

export async function startMod(id) {
    // load mod
    mod.id = id;

    let text;
    try {
        const res = await fetch('/mods/mods.txt');
        text = await res.text();
    } catch (e) {
        console.error('Failed to load mods.txt:', e);
        return;
    }

    const lines = text.split('\n');
    lines.forEach(line => {
        mods.push(line);
    });

    mod.name = mods[id];

    // load characters
    try {
        const res = await fetch(`/mods/${mod.name}/characters/characters.txt`);
        const characters_file = await res.text();
        characters_file.split('\n').forEach(char => {
            characters.push(char);
        });
    } catch (e) {
        console.warn('Failed to load characters.txt:', e);
    }
}

export async function loadCharacter(name) {
    let text;
    try {
        const res = await fetch(`/mods/${mod.name}/characters/${name}/character.json`)
        text = await res.text();
        return JSON.parse(text);
    } catch (e) {
        console.error(`Failed to load character ${name}:`, e);
        return {}
    }
}