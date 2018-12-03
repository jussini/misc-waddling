
const getInputLines = require('../getInputLines')

const parseCut = line => {
    const regex = /#(.*) @ (.*),(.*): (.*)x(.*)/;
    const match = regex.exec(line);
    return {
        id: match[1],
        x: parseInt(match[2]),
        y: parseInt(match[3]),
        w: parseInt(match[4]),
        h: parseInt(match[5])
    };
}

const initializeBitmap = size => {
    return [...Array(size.h)].map(row => {
        return [...Array(size.w)].map(col => '.')
    })
}

const layoutCuts = (emptyCanvas, cuts) => {
    return cuts.reduce((canvas, cut) => {
        for (let y = cut.y; y < cut.y + cut.h; y++) {
            for(let x = cut.x; x < cut.x + cut.w; x++) {
                if (canvas[y][x] === '.') {
                    canvas[y][x] = cut.id;
                } else {
                    canvas[y][x] = "x"
                }
            }
        }
        return canvas;
    }, emptyCanvas);
}

const countOverlaps = bitmap => {
    return bitmap.reduce((sum, row) => {
        return sum + row.filter(col => col === "x").length
    }, 0)
}

const cutIsClean = (bitmap, cut) => {
    for (let y = cut.y; y < cut.y + cut.h; y++) {
        for(let x = cut.x; x < cut.x + cut.w; x++) {
            if (bitmap[y][x] === "x") {
                return false;
            } 
        }
    }
    return true;
}

const cleanCuts = (bitmap, cuts) => {
    return cuts.filter(cut => cutIsClean(bitmap, cut));    
}

getInputLines(process.argv[2]).then(lines => {
    const cuts = lines.map(parseCut);
    const bitmapSize = cuts.reduce((acc, cur) => {
        return {
            w: Math.max(acc.w, cur.x + cur.w),
            h: Math.max(acc.h, cur.y + cur.h)
        }
    }, {w: 0, h: 0})

    const canvas = initializeBitmap(bitmapSize);

    const bitmap = layoutCuts(canvas, cuts);

    const overlaps = countOverlaps(bitmap);

    console.log("Number of overlapping squares", overlaps)

    console.log("Clean cuts", cleanCuts(bitmap, cuts));

}) 

