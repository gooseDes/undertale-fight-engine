if getTime() - global.lastShooted > 1.1 then
    createBlaster(round(math.random())*0.1+0.45, 0.2, 0.1, 90)
    global.lastShooted = getTime()
    setScreenRotation(math.random()*360)
end