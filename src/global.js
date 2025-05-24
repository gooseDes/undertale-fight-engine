import { LuaRuntime } from "/src/engine/lua.js";

export const to_update = [];
export const to_draw = [];
export const lua_runtime = new LuaRuntime();
export var mods = [];
export var mod = { id: 0, name : '' };
export var global = {};

export function startMod(id) {
    mod.id = id;
    fetch('/mods/mods.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n');
        lines.forEach(line => {
          mods.push(line);
        });
        mod.name = mods[id];
      });
}