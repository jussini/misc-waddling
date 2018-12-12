
const getInputLines = require('../getInputLines')
const assert = require("assert")

const range = (num, start = 0, jump = 1) => [...Array(num)].map((x,i) => (i*jump) + start)

const initializeGrid = (size, serialNumber) => {
    return range(size).map((col, xIndex) => {
        return range(size).map((row, yIndex) => {
            const rackId = xIndex + 10 + 1
            let powerLevel = rackId * (yIndex + 1)
            powerLevel += serialNumber
            powerLevel *= rackId
            const powerLevelHundreds = Math.floor(powerLevel / 100) + ""
            powerLevel = parseInt(powerLevelHundreds[powerLevelHundreds.length -1])
            powerLevel -= 5
            return powerLevel
        })
    })
}

assert(initializeGrid(300, 8)[2][4] == 4) // at 3,5 
assert(initializeGrid(300, 57)[121][78] == -5) // at 122,79
assert(initializeGrid(300, 39)[216][195] == 0) // at 217,196

const getMaxPowerArea = (grid, size) => {
    let maxPower = Number.MIN_SAFE_INTEGER
    let xCoord = -1
    let yCoord = -1
    grid.forEach((col, xi) => {
        col.forEach((item, yi) => {
            if (xi < grid.length - (size -1)  && yi < col.length - (size -1)) {

                let sum = 0;
                range(size, xi).forEach(areaX => {
                    range(size, yi).forEach(areaY => {
                        sum += grid[areaX][areaY]
                    })
                })                

                if (sum > maxPower) {
                    maxPower = sum
                    xCoord = xi + 1
                    yCoord = yi + 1
                }
            }
        })
    })
    return {maxPower, xCoord, yCoord}
}


const t1 = getMaxPowerArea(initializeGrid(300,18), 3)
assert(t1.maxPower == 29 && t1.xCoord == 33 && t1.yCoord == 45)

const t2 = getMaxPowerArea(initializeGrid(300,42), 3)
assert(t2.maxPower == 30 && t2.xCoord == 21 && t2.yCoord == 61)

const grid = initializeGrid(300, 3613)
const maxPower = getMaxPowerArea(grid, 3)

console.log(maxPower);
//console.log(grid)

const t3 = getMaxPowerArea(initializeGrid(300,42), 3)

//const areaSizes = range(300, 1)
//const allMaxPowers = areaSizes.map(size => getMaxPowerArea(initializeGrid(300, 3613), size))
