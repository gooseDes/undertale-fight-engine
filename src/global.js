import { LuaRuntime } from "/src/engine/lua.js";

export const to_update = [];
export const to_draw = [];
export const lua_runtime = new LuaRuntime();
export var global = {};