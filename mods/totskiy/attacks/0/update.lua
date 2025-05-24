field.width = field.w * 0.8
field.height = field.h * 0.7

if getTime() - global.lastShooted >= 1.6 then
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
end