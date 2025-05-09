import { LuaRuntime } from "./lua.js";

export const to_update = [];
export const to_draw = [];
export const lua_runtime = new LuaRuntime();
export var global = {};