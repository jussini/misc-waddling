
const getInputLines = require('../getInputLines')
const assert = require("assert")

const collapses = (a,b) => {
    return a.toUpperCase() === b.toUpperCase() && a !== b 
}

const testCollapse = () => {

    assert(collapses("A","a") === true);
    assert(collapses("a","A") === true);
    assert(collapses("A","A") === false);
    assert(collapses("a","a") === false);
    assert(collapses("A","b") === false);
    assert(collapses("b","A") === false);
    assert(collapses("B","A") === false);
    assert(collapses("A","B") === false);
}

// works, but will hit the stack limit with long input
const fasterCollapse = (polymer, startIndex) => {
    if (polymer.length < 2 || polymer.length <= startIndex) {
        return polymer;
    }
    
    const i = Math.max(1, startIndex);
    if (collapses(polymer[i -1], polymer[i])) {
        return fasterCollapse(polymer.substring(0,i-1)+polymer.substring(i+1), i - 1)
    }

    return fasterCollapse(polymer, startIndex + 1)
}


const fasterCollapseNR = (startPolymer) => {

    let polymer = startPolymer
    let i = 1
    while (polymer.length >= 2 && i < polymer.length) {
        if (collapses(polymer[i -1], polymer[i])) {
            polymer = polymer.substring(0,i-1)+polymer.substring(i+1)
            i = Math.max(1, i - 1)
        } else {
            i = i + 1
        }
    }
    
    return polymer

}

getInputLines(process.argv[2]).then(lines => {
    testCollapse()

    lines.map(line => {
        // Part 1
        const collapsed = fasterCollapseNR(line, 1)
        console.log("Part one: ", collapsed.length)

        // Part 2
        const uniqueTypes = new Set(line.toLowerCase())
        const lengths = []
        for (type of uniqueTypes) {
            const re = new RegExp(`[${type}]`, 'gi');
 
            const fixed = line.replace(re,"");
            lengths.push(fasterCollapseNR(fixed).length)
        }
        console.log("Part two", lengths.sort()[0])
    })

}) 

