setSoulPosition(0.5, 0.5)
setFieldSize(0.2, 0.25)

for i = 0, 10 do 
    createEnemy("default", 0.75, 0-i, 0.5, 0.01).setMovement(0, 0.5)
    createEnemy("default", 0.25, -0.5-i, 0.5, 0.01).setMovement(0, 0.5)
end

for i = 0, 6 do 
    createEnemy("default", 0-i, 0, 0.01, 0.5).setMovement(0.6, 0)
    createEnemy("default", -0.5-i, 1, 0.01, 0.5).setMovement(0.6, 0)
end