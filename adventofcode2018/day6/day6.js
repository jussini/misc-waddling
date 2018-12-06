
const getInputLines = require('../getInputLines')
const assert = require("assert")


const parseCoordinates = lines => {
    const re = /(.*), (.*)/
    return lines.map((line, index) => {
        const match = line.match(re)
        return {x: parseInt(match[1]), y: parseInt(match[2]), id: index}
    })
}

const getCanvasSize = coordinates => {
    const limites = coordinates.reduce((acc, cur) => {
        if (cur.x > acc.x) {
            acc.x = cur.x
        }
        if (cur.y > acc.y) {
            acc.y = cur.y
        }
        if (cur.x < acc.minX) {
            acc.minX = cur.x
        }
        if (cur.y < acc.minY) {
            acc.minY = cur.y
        }
        return acc;
    }, {x: 0, y: 0, minX: Number.MAX_SAFE_INTEGER, minY: Number.MAX_SAFE_INTEGER})
    limites.x = limites.x + limites.minX
    limites.y = limites.y + limites.minY
    return limites
}

const createCanvas = canvasSize => {
    return [...Array(canvasSize.y)].map(() => {
        return [...Array(canvasSize.x)].map(() => {
            return {symbol: ".", nearestDistance: Number.MAX_SAFE_INTEGER}
        })
    })
}

const printCanvas = canvas => {
    canvas.map(row => console.log(row.map(c => c.symbol).join("")))
}

const paintCoordinates = (coordinates, canvas) => {
    coordinates.forEach((coord,index) => {
        canvas[coord.y][coord.x].symbol = symbolForId(coord.id)
    })
}

const distance = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

const symbolForId = (id, alt) => {
    // for dev mode
    //if (alt) return String.fromCharCode(97 + id);
    //return String.fromCharCode(65 + id);

    // for running the task, we run out of alphabets
    if (alt) return "_" + id //String.fromCharCode(97 + id);
    return "" + id // String.fromCharCode(65 + id);
}

const paintClosestAreas = (coordinates, canvas) => {
    coordinates.forEach(coord => {
        canvas.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                const distanceFromCoord = distance(coord, {x: colIndex, y: rowIndex});
                if (distanceFromCoord == col.nearestDistance) {
                    col.symbol = "."
                    col.closestTo.push(coord.id)
                }
                else if (distanceFromCoord < col.nearestDistance) {
                    col.symbol = distanceFromCoord == 0 ? symbolForId(coord.id) : symbolForId(coord.id, true)
                    col.nearestDistance = distanceFromCoord
                    col.closestTo = [coord.id]
                }
            })
        })
    })
} 

const flatten = array => {
    return [].concat.apply([], array);
}

const findBorderCoordinates = canvas => {
    const top = flatten(canvas[0].map(item => item.closestTo.length === 1 ? item.closestTo : []));
    const bottom = flatten(canvas[canvas.length -1].map(item => item.closestTo.length === 1 ? item.closestTo : []))
    const sides = flatten(canvas.reduce((acc, curRow) => {
        acc.push(curRow[0].closestTo.length === 1 ? curRow[0].closestTo : [])
        acc.push(curRow[curRow.length - 1].closestTo.length === 1 ? curRow[curRow.length - 1].closestTo : [])
        return acc
    }, []))

    const flattened = [].concat.apply([], [top, bottom, sides])

    return new Set(flattened)
}

const areaCoordinateHas = (coordinate, canvas) => {
    const coordinateSymbols = [symbolForId(coordinate.id), symbolForId(coordinate.id, true)]
    let hits = 0;
    canvas.forEach(row => {
        row.forEach(col => {
            if (coordinateSymbols.indexOf(col.symbol) !== -1) {
                hits++;
            }
        })
    })
    return hits;
}

const sumOfItems = array => {
    return array.reduce((acc, i) => acc + i, 0)
}


const findLocationByCoordinates = (coordinates, x, y) => {
    return coordinates.find(c => c.x == x && c.y == y)
}

const paintDistancesToAllCoordinates = (canvas, coordinates, limit) => {
    canvas.forEach((row, rowIndex) => {
        row.forEach((item, colIndex) => {
            const allDistances = coordinates.map(coord => {
                // finally distance to all coordinates
                return distance(coord, {x: colIndex, y: rowIndex})
            })
            item.sumOfDistances = sumOfItems(allDistances);

            const location = findLocationByCoordinates(coordinates, colIndex, rowIndex)
            
            if (location) {
                item.symbol = symbolForId(location.id);
            } else if (item.sumOfDistances < limit) {
                item.symbol = "#"
            } else {
                item.symbol = "."
            }
        })
    })
}

const sizeOfAreaWithinTotalLimitOfAllCoordinates = (canvas, limit) => {
    let hits = 0
    canvas.forEach(row => {
        row.forEach(item => {
            if (item.sumOfDistances < limit) {
                hits++
            }
        })
    })
    return hits
}

getInputLines(process.argv[2]).then(lines => {

    const coordinates = parseCoordinates(lines)
    const canvasSize = getCanvasSize(coordinates)
    const canvas = createCanvas(canvasSize);

    paintCoordinates(coordinates, canvas)

    // this may be slow and silly, but find distances to each given coordinate from
    // each point on the canvas
    paintClosestAreas(coordinates, canvas)

    // any symbol on the edge of the map will continue as infinite area, 
    const borderCoordinates = findBorderCoordinates(canvas);

    const suitableCoordinates = coordinates.filter((c,ci) => !borderCoordinates.has(ci))

    const areaSizes = suitableCoordinates.map(coord => areaCoordinateHas(coord, canvas))

    console.log("part 1, max area ", Math.max(...areaSizes))
    
    //const limit = 32;
    const limit = 10000;
    paintDistancesToAllCoordinates(canvas, coordinates, limit)
    //printCanvas(canvas);


    const areaSize = sizeOfAreaWithinTotalLimitOfAllCoordinates(canvas, limit) 
    console.log("")
    console.log("part 2, safe area", areaSize)
}) 

