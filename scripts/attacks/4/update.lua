function angleTo(x1, y1, x2, y2)
    local dx = x2 - x1
    local dy = y2 - y1
    local angle = math.atan(dy / dx)

    if dx < 0 then
        angle = angle + math.pi
    end

    return math.deg(angle)
end

if getTime() - global.lastShooted > 1 then
    global.lastShooted = getTime()
    local ran = round(rand(0, 3))
    field.offsetX = math.sin(field.sinceDodgingStarted) * field.w * 0.1
    field.offsetY = math.cos(field.sinceDodgingStarted * 1.1) * field.h * 0.1
    if ran == 0 then
        createEnemy("default", 0, 0.5+(round(random())-0.5)*0.3, 0.01, 0.15).setMovement(1.2, 0).setGravity(-0.01, 0)
    elseif ran == 1 then
        createEnemy("default", 1, 0.5+(round(random())-0.5)*0.3, 0.01, 0.15).setMovement(-1.2, 0).setGravity(0.01, 0)
    elseif ran == 2 then
        createEnemy("default", 0.5+(round(random())-0.5)*0.2, 0, 0.2, 0.01).setMovement(0, 0.8).setGravity(0, -0.008)
    elseif ran == 3 then
        createEnemy("default", 0.5+(round(random())-0.5)*0.2, 1, 0.2, 0.01).setMovement(0, -0.8).setGravity(0, 0.008)
    end
    ran = round(rand(0, 2))
    if ran == 0 then
        createBlaster(0.1, 0.5+round(random())*0.2, 0.1, 0)
    end
end