
const getInputLines = require('../getInputLines')
const assert = require("assert")
const utils = require("../utils")

const range = utils.range;

const TREE = "|"
const OPEN = "."
const YARD = "#"

const parseMap = lines => {

    const map = lines.map(row => {
        return row.split("").map(col => col)
    })
    return map
}

const countSurrounding = (map, row, col, symbol) => {
    let hits = 0
    range(3, -1).forEach(rowd => {
        range(3, -1).forEach(cold => {
            if (map[row + rowd] !== undefined &&
                map[row + rowd][col + cold] === symbol 
                && !(cold === 0 && rowd === 0)
                ) {
                hits++
            }
        })
    })
    return hits
}

const nextAcre = (map, row, col) => {
    const current = map[row][col]
    if (current === OPEN ) {
        return countSurrounding(map, row, col, TREE) >= 3 ? TREE : current
    }
    if (current === TREE ) {
        return countSurrounding(map, row, col, YARD) >= 3 ? YARD : current
    }
    if (current === YARD ) {
        return countSurrounding(map, row, col, YARD) >= 1 &&  countSurrounding(map, row, col, TREE) >= 1 ? YARD : OPEN
    }
}

const processMinute = map => {
    return map.map((row, rowIndex) => {
        return row.map((col, colIndex) => {
            return nextAcre(map, rowIndex, colIndex)
        }) 
    })
}

const printMap = map => {
    const asString = map.map(row => {
        return row.join("")
    }).join("\n")
    console.log(asString)
}

const countSymbols = (map, symbol) => {
    let hits = 0;
    map.forEach(row => {
        row.forEach(acre => {
            if (acre === symbol) hits++;
        })
    })
    return hits
}

const demoMode = map => {
    setInterval(() => {
        printMap(map)
        map = processMinute(map)
        //console.clear()
    }, 50)
}

const resourcesAt = (map, atMinutes) => {

    let value = 0
    for (let minutes = 1; minutes <= atMinutes; minutes++) {
        map = processMinute(map)
        const wooded = countSymbols(map, TREE)
        const yards = countSymbols(map, YARD)
        value = wooded * yards
        //console.log(minutes, value)
    }
    return value;
}

getInputLines(process.argv[2]).then(lines => {
    let map = parseMap(lines)

    if (process.argv[3] === "demo") {
        demoMode(map)
    } else {
        const minutes = process.argv[3]
        const resources = resourcesAt(map, parseInt(minutes))
        console.log("Resources at ", minutes, resources)

        // after 400 something, the resources start to oscillate with wavelength of 28
        // therefore, the sample at 524 is same as 1,000,000,000 (524 + (28*35.714.267))
    }


    //console.log(countSurrounding(map, 0, 3, YARD), countSurrounding(map, 0, 3, TREE))
    //console.log(countSurrounding(map, 1, 9, YARD))
    
    //printMap(map)
    //console.log("")
    //printMap(processMinute(map))
})
    

