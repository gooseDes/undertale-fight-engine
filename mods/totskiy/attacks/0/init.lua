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
while x*getWindowWidth() > getWindowWidth()/2 - field.width/2 + field.offsetX and x*getWindowWidth() < getWindowWidth()/2 + field.width/2 + field.offsetX do
    x = math.random()
end
while y*getWindowHeight() > getWindowHeight()/2 - field.height/2 + field.offsetY and y*getWindowHeight() < getWindowHeight()/2 + field.height/2 + field.offsetY do
    y = math.random()
end
local dir = angleTo(x*getWindowWidth(), y*getWindowHeight(), soul.x, soul.y)

createBlaster(x, y, 1/12, dir)
global.lastShooted = getTime()
global.firstShooted = getTime()

hideButtons()

for i = 1, 5 do
    createEnemy("default", 0.25, 0-i*0.5, 0.5, 0.01).setMovement(0, 0.2+i*0.005)
end
for i = 1, 5 do
    createEnemy("default", 0.75, 0.25-i*0.5, 0.5, 0.01).setMovement(0, 0.2+i*0.005)
end