export class LuaRuntime {
  constructor() {
    const { lua, lauxlib, lualib } = fengari;
    this.lua = lua;
    this.lauxlib = lauxlib;
    this.lualib = lualib;
    this.to_luastring = fengari.to_luastring;
    
    // Object registry
    this.jsObjects = new Map();
    this.nextObjectId = 1;

    this.L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(this.L);
    
    // Create object metatable
    this.createObjectMetatable();
  }

  createObjectMetatable() {
    const { lua, to_luastring } = this;
    
    // Create object metatable
    lua.lua_newtable(this.L);
    
    // __index metamethod
    lua.lua_pushstring(this.L, to_luastring('__index'));
    lua.lua_pushcfunction(this.L, (L) => {
      // Get the JS object
      lua.lua_getfield(L, 1, to_luastring('__jsObjectId'));
      const objectId = lua.lua_tojsstring(L, -1);
      lua.lua_pop(L, 1);
      
      const jsObject = this.jsObjects.get(objectId);
      if (!jsObject) {
        lua.lua_pushnil(L);
        return 1;
      }
      
      // Get the requested property/method
      const key = lua.lua_tojsstring(L, 2);
      const value = jsObject[key];
      
      if (typeof value === 'function') {
        // Return a Lua function that calls the JS method
        lua.lua_pushcfunction(L, (L) => {
          const n = lua.lua_gettop(L);
          const args = [];
          
          for (let i = 1; i <= n; i++) {
            args.push(this.luaToJs(L, i));
          }
          
          try {
            const result = value.apply(jsObject, args);
            return this.jsToLua(L, result);
          } catch (e) {
            console.error('Error calling JS method:', e);
            lua.lua_pushnil(L);
            return 1;
          }
        });
      } else {
        // Return the property value
        this.jsToLua(L, value);
      }
      
      return 1;
    });
    lua.lua_settable(this.L, -3);
    
    // __newindex metamethod
    lua.lua_pushstring(this.L, to_luastring('__newindex'));
    lua.lua_pushcfunction(this.L, (L) => {
      // Get the JS object
      lua.lua_getfield(L, 1, to_luastring('__jsObjectId'));
      const objectId = lua.lua_tojsstring(L, -1);
      lua.lua_pop(L, 1);
      
      const jsObject = this.jsObjects.get(objectId);
      if (!jsObject) return 0;
      
      // Set the property
      const key = lua.lua_tojsstring(L, 2);
      const value = this.luaToJs(L, 3);
      jsObject[key] = value;
      
      return 0;
    });
    lua.lua_settable(this.L, -3);
    
    // Store the metatable in a global variable (alternative to registry)
    lua.lua_setglobal(this.L, to_luastring('__jsObjectMetatable'));
  }

  luaToJs(L, index) {
    const { lua, to_luastring } = this;
    
    if (lua.lua_isnumber(L, index)) {
      return lua.lua_tonumber(L, index);
    } else if (lua.lua_isstring(L, index)) {
      return lua.lua_tojsstring(L, index);
    } else if (lua.lua_isboolean(L, index)) {
      return lua.lua_toboolean(L, index);
    } else if (lua.lua_istable(L, index)) {
      // Handle tables if needed
      return {}; // Simplified
    } else if (lua.lua_isuserdata(L, index)) {
      // Handle JS objects
      lua.lua_getfield(L, index, to_luastring('__jsObjectId'));
      const objectId = lua.lua_tojsstring(L, -1);
      lua.lua_pop(L, 1);
      return this.jsObjects.get(objectId);
    }
    return undefined;
  }

  jsToLua(L, value) {
    const { lua, to_luastring } = this;
    
    if (value === undefined || value === null) {
      lua.lua_pushnil(L);
    } else if (typeof value === 'number') {
      lua.lua_pushnumber(L, value);
    } else if (typeof value === 'string') {
      lua.lua_pushstring(L, to_luastring(value));
    } else if (typeof value === 'boolean') {
      lua.lua_pushboolean(L, value);
    } else if (typeof value === 'object') {
      // Create a Lua proxy for JS objects
      const objectId = `js_obj_${this.nextObjectId++}`;
      this.jsObjects.set(objectId, value);
      
      lua.lua_newtable(L);
      lua.lua_pushstring(L, to_luastring('__jsObjectId'));
      lua.lua_pushstring(L, to_luastring(objectId));
      lua.lua_settable(L, -3);
      
      // Set metatable by getting it from global
      lua.lua_getglobal(L, to_luastring('__jsObjectMetatable'));
      lua.lua_setmetatable(L, -2);
    } else {
      lua.lua_pushnil(L);
    }
    
    return 1; // Number of values pushed
  }

  register(name, jsFunc) {
    const { lua, to_luastring } = this;
    lua.lua_pushstring(this.L, to_luastring(name));

    lua.lua_pushcfunction(this.L, (L) => {
      const n = lua.lua_gettop(L);
      const args = [];

      for (let i = 1; i <= n; i++) {
        args.push(this.luaToJs(L, i));
      }

      try {
        const result = jsFunc(...args);
        return this.jsToLua(L, result);
      } catch (e) {
        console.error(`Error in ${name}:`, e);
        lua.lua_pushnil(L);
        return 1;
      }
    });

    lua.lua_setglobal(this.L, to_luastring(name));
  }

  registerObject(name, obj) {
    const { lua, to_luastring } = this;

    // Create the main table
    lua.lua_newtable(this.L);

    // Create metatable
    lua.lua_newtable(this.L);

    // __index metamethod - handles property/method access
    lua.lua_pushstring(this.L, to_luastring('__index'));
    lua.lua_pushcfunction(this.L, (L) => {
      const key = lua.lua_tojsstring(L, 2);
      const value = obj[key];

      if (value !== undefined) {
        if (typeof value === 'function') {
          // Return a function that properly binds 'this'
          lua.lua_pushcfunction(L, (L) => {
            const n = lua.lua_gettop(L);
            const args = [];

            for (let i = 1; i <= n; i++) {
              if (lua.lua_isnumber(L, i)) {
                args.push(lua.lua_tonumber(L, i));
              } else if (lua.lua_isstring(L, i)) {
                args.push(lua.lua_tojsstring(L, i));
              } else {
                args.push(undefined);
              }
            }

            try {
              const result = value.apply(obj, args);
              if (result !== undefined) {
                if (typeof result === 'number') {
                  lua.lua_pushnumber(L, result);
                } else if (typeof result === 'string') {
                  lua.lua_pushstring(L, to_luastring(result));
                } else if (typeof result === 'boolean') {
                  lua.lua_pushboolean(L, result);
                } else {
                  lua.lua_pushnil(L);
                }
                return 1;
              }
            } catch (e) {
              console.error(`Error calling ${key}:`, e);
            }
            return 0;
          });
        } else if (typeof value === 'number') {
          lua.lua_pushnumber(L, value);
        } else if (typeof value === 'string') {
          lua.lua_pushstring(L, to_luastring(value));
        } else if (typeof value === 'boolean') {
          lua.lua_pushboolean(L, value);
        } else {
          lua.lua_pushnil(L);
        }
      } else {
        lua.lua_pushnil(L);
      }

      return 1;
    });
    lua.lua_settable(this.L, -3);

    // __newindex metamethod - handles property assignment
    lua.lua_pushstring(this.L, to_luastring('__newindex'));
    lua.lua_pushcfunction(this.L, (L) => {
      const key = lua.lua_tojsstring(L, 2);
      
      if (lua.lua_isnumber(L, 3)) {
        obj[key] = lua.lua_tonumber(L, 3);
      } else if (lua.lua_isstring(L, 3)) {
        obj[key] = lua.lua_tojsstring(L, 3);
      } else if (lua.lua_isboolean(L, 3)) {
        obj[key] = lua.lua_toboolean(L, 3);
      } else {
        console.warn(`Cannot set property ${key} - unsupported type`);
      }
      
      return 0;
    });
    lua.lua_settable(this.L, -3);

    // Set the metatable
    lua.lua_setmetatable(this.L, -2);

    // Set the global variable
    lua.lua_setglobal(this.L, to_luastring(name));
  }

  run(code) {
    const { lauxlib, to_luastring } = this;
    if (typeof code !== 'string') {
      throw new TypeError('Lua code must be a string!');
    }
    lauxlib.luaL_dostring(this.L, to_luastring(code));
  }
}

function _loadFile(path) {
  return fetch(path)
    .then(function(response) {
      if (!response.ok) throw new Error('Error loading file: ' + response.statusText);
      return response.text();
    })
    .then(function(text) {
      return text;
    })
    .catch(function(err) {
      return 'no';
    });
}

export function loadFile(path) {
  return _loadFile(path);
}
