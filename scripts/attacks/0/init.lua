local numPairs = 60  
local gapHeight = 0.26 
local minY = 0.2     
local maxY = 0.4  
local maxYGapChange = 0.1
local spacing = 0.09   
local startX = 1   
local wallWidth = 0.01  
local wallThickness = 0.2
local moveSpeed = -0.3

local prevGapCenter = (minY + maxY) / 2

for i = 0, numPairs - 1 do
    local gapCenter = prevGapCenter + (math.random() * 2 - 1) * maxYGapChange
    gapCenter = math.max(minY, math.min(maxY, gapCenter))
    
    createEnemy("bone",
                startX + i * spacing,
                gapCenter - gapHeight/2 - wallThickness/2,  
                wallWidth,
                wallThickness).setMovement(moveSpeed - i*0.0035, math.random()*(-0.005))
    
    
    createEnemy("bone",
                startX + i * spacing,
                gapCenter + gapHeight/2 + wallThickness/2,  
                wallWidth,
                wallThickness).setMovement(moveSpeed - i*0.0035, math.random()*(0.005))
    
    prevGapCenter = gapCenter  
end
