function angleTo(x1, y1, x2, y2)
    local dx = x2 - x1
    local dy = y2 - y1
    local angle = math.atan(dy / dx)

    if dx < 0 then
        angle = angle + math.pi
    end

    return math.deg(angle)
end

local x = math.random()
local y = math.random()
local dir = angleTo(x*getWindowWidth(), y*getWindowHeight(), soul.x, soul.y)

createBlaster(x, y, 1/12, dir)
global.lastShooted = os.time()
global.firstShooted = os.time()