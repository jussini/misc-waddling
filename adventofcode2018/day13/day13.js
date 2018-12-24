
const getInputLines = require('../getInputLines')
const assert = require("assert")
const utils = require("../utils")

const range = utils.range;


const symbolToTrack = symbol => {
    if (symbol === ">" || symbol === "<") {
        return "-"
    }
    if (symbol === "^" || symbol === "v") {
        return "|"
    }
    return symbol;
}

const isCart = symbol => {
    return symbol === ">" || symbol === "<" || symbol === "^" || symbol === "v"
}

assert(isCart(">"))
assert(!isCart(" "))

/* some direction */
const LEFT = "LEFT"
const RIGHT = "RIGHT"
const UP = "UP"
const DOWN = "DOWN"
const STRAIGHT = "STRAIGHT"

const parseMap = lines => {
    return lines.map(line => {
        return line.split("").map(col => {
            return {
                track: symbolToTrack(col),
                cart: isCart(col) ? {nextTurn: LEFT, symbol: col} : null
            }
        })
    })
}

const printMap = map => {
    const asString = map.map(line => {
        return line.map(col => {
            return col.cart === null ? col.track : col.cart.symbol
        }).join("")
    }).join("\n")
    console.log(asString)
}

const moveCarts = (map, tick, moveFunction) => {
    map.forEach((line, lineIndex) => {
        line.forEach((col, colIndex) => {
            if (col.cart !== null && col.cart.tick !== tick && col.cart.symbol !== "X") {
                moveFunction(map, lineIndex, colIndex, tick)                
            }
        })
    })
}

const getVector = cart => {
    return {
        col: cart.symbol === ">" ? 1 : (cart.symbol === "<" ? -1 : 0),
        line: cart.symbol === "v" ? 1 : (cart.symbol === "^" ? -1 : 0),
    }
}


console.log("gv1", getVector({symbol: ">"}))
console.log("gv2", getVector({symbol: "v"}))

const trackToCartDirection = (track, currentDir, cart) => {
    if (track === "\\" && currentDir === ">") {
        return "v"
    }
    if (track === "\\" && currentDir === "<") {
        return "^"
    }
    if (track === "\\" && currentDir === "^") {
        return "<"
    }
    if (track === "\\" && currentDir === "v") {
        return ">"
    }
    if (track === "/" && currentDir === ">") {
        return "^"
    }
    if (track === "/" && currentDir === "<") {
        return "v"
    }
    if (track === "/" && currentDir === "^") {
        return ">"
    }
    if (track === "/" && currentDir === "v") {
        return "<"
    }
    if (track === "+") {
        if (cart.nextTurn === LEFT) {
            cart.nextTurn = STRAIGHT
            if (currentDir ===  "^") {
                return "<"
            }
            if (currentDir ===  ">") {
                return "^"
            }
            if (currentDir ===  "v") {
                return ">"
            }
            if (currentDir ===  "<") {
                return "v"
            }
        }

        if (cart.nextTurn === STRAIGHT) {
            cart.nextTurn = RIGHT
            return currentDir
        }

        if (cart.nextTurn === RIGHT) {
            cart.nextTurn = LEFT
            if (currentDir ===  "^") {
                return ">"
            }
            if (currentDir ===  ">") {
                return "v"
            }
            if (currentDir ===  "v") {
                return "<"
            }
            if (currentDir ===  "<") {
                return "^"
            }
        }
    }
    return currentDir

}

const moveCart = (map, line, col, tick) => {
    const cart = map[line][col].cart
    assert(cart !== null && cart !== undefined)
    const vector = getVector(cart);
    const newPosition = map[line + vector.line][col + vector.col]
    if (newPosition.cart !== null) {
        newPosition.track = "X"
        newPosition.cart = {
            symbol: "X",
            tick
        }
        map[line][col].cart = null
        // ewww, such horrible way to get this
        throw `Crash at ${col+vector.col},${line+vector.line} on tick ${tick}`
    } else {
        newPosition.cart = {
            symbol: trackToCartDirection(newPosition.track, cart.symbol, cart),
            nextTurn: cart.nextTurn,
            tick
        }
        map[line][col].cart = null
    }
}

const finalCartLocation = map => {
    let previousHit = ""
    for (rowIndex = 0; rowIndex < map.length; rowIndex++) {
        for (colIndex = 0; colIndex < map[rowIndex].length; colIndex++) {
            if (map[rowIndex][colIndex].cart !== null && previousHit === "") {
                previousHit = colIndex + "," + rowIndex
            } else if (map[rowIndex][colIndex].cart !== null && previousHit !== "") {
                // there was a previous one, so more than one left
                return ""
            }
        }        
    }
    return previousHit
}

const moveCartAndClearCrash = (map, line, col, tick) => {
    const cart = map[line][col].cart
    assert(cart !== null && cart !== undefined)
    const vector = getVector(cart);
    const newPosition = map[line + vector.line][col + vector.col]
    if (newPosition.cart !== null) {
        newPosition.cart = null
        map[line][col].cart = null
        console.log(`Crash at ${col+vector.col},${line+vector.line} on tick ${tick}`)
    } else {
        newPosition.cart = {
            symbol: trackToCartDirection(newPosition.track, cart.symbol, cart),
            nextTurn: cart.nextTurn,
            tick
        }
        map[line][col].cart = null
    }
}

getInputLines(process.argv[2]).then(lines => {

    const map = parseMap(lines)
    let tick = 0;
    let interval = setInterval(() => {
        try {
            moveCarts(map, tick, moveCart)
        } catch (err) {
            console.log("Part 1", err)
            clearInterval(interval)
        }
        tick++
    }, 0)

    let tick2 = 0;
    const map2 = parseMap(lines)
    const interval2 = setInterval(() => {

        moveCarts(map2, tick2, moveCartAndClearCrash)

        const finalLocation = finalCartLocation(map2)
        if (finalLocation !== "") {
            console.log(`Final cart at ${finalLocation} on tick ${tick2}`)
            clearInterval(interval2)
        }
        tick2++
    }, 0)


})
    

