
const getInputLines = require('../getInputLines')
const assert = require("assert")

const parseStar = line => {
    const regex = /position=<(.+),(.+)> velocity=<(.+),(.+)>/

    const match = regex.exec(line);
    return {
        x: parseInt(match[1]),
        y: parseInt(match[2]),
        vx: parseInt(match[3]),
        vy: parseInt(match[4])
    };
}

const canvasSize = stars => {
    const dimensions = stars.reduce((acc, cur) => {
        return {
            minx: Math.min(acc.minx, cur.x),
            miny: Math.min(acc.miny, cur.y),
            maxx: Math.max(acc.maxx, cur.x),
            maxy: Math.max(acc.maxy, cur.x)
        }
    }, {
        minx: Number.MAX_SAFE_INTEGER,
        miny: Number.MAX_SAFE_INTEGER, 
        maxx: Number.MIN_SAFE_INTEGER, 
        maxy: Number.MIN_SAFE_INTEGER})

    return {
        w: dimensions.maxx - dimensions.minx, 
        h: dimensions.maxy - dimensions.miny,
        minx: dimensions.minx,
        miny: dimensions.miny
    }
}

const moveSeconds = (stars, seconds) => {
    return stars.map(star => ({
        x: star.x + seconds * star.vx,
        y: star.y + seconds * star.vy,
        vx: star.vx,
        vy: star.vy
    }));
}

// move all stars so that smallest x and y have value 0,
const translate = (stars, fullSize) => {
    const dx = -fullSize.minx
    const dy = -fullSize.miny

    return stars.map(star => {
        return {
            ...star,
            x: star.x + dx,
            y: star.y + dy
        }
    })

}

const scale = (stars, wFactor, hFactor) => {
    return stars.map(star => ({
        ...star,
        x: Math.floor(wFactor * star.x),
        y: Math.floor(hFactor * star.y)
    }))
}

const initializeBitmap = (w,h) => {
    return [...Array(h)].map(row => {
        return [...Array(w)].map(col => '.')
    })
}

const paintStars = (stars, canvas) => {
    stars.forEach(star => {
        canvas[star.y][star.x] = "#"
    })
}

const printCanvas = canvas => {
    canvas.forEach(row => {
        console.log(row.join(""))
    })
}

getInputLines(process.argv[2]).then(lines => {

    // you will hit about right on with, node day10.js input.txt 10656 120 90
    const stars = lines.map(parseStar)
    let seconds = parseInt(process.argv[3]) //10656
    //setInterval(() => {
        console.clear()
        console.log("At", seconds)
        const withMovement = moveSeconds(stars, seconds)
        const fullSize = canvasSize(withMovement)
        const translated = translate(withMovement, fullSize)
    
        const targetWidth = parseInt(process.argv[4]) // 120
        const targetHeight = parseInt(process.argv[5]);// 90
        const scaleWidth = targetWidth / fullSize.w
        const scaleHeight = targetHeight / fullSize.h
    
        const scaled = scale(translated, scaleWidth, scaleHeight)
    
        const canvas = initializeBitmap(targetWidth, targetHeight);
        paintStars(scaled, canvas)
        printCanvas(canvas)
        seconds++
    //}, 1000) // had to work with values 50 -> 1000 with several start seconds to find it....

})
    

