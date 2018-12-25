
const getInputLines = require('../getInputLines')
const assert = require("assert")
const utils = require("../utils")

const range = utils.range;

const addr = (r,a,b,c,) => {
    r[c] = r[a] + r[b]
}
const addi = (r,a,b,c) => {
    r[c] = r[a] + b
}

const mulr = (r,a,b,c) => {
    r[c] = r[a] * r[b]
}
const muli = (r,a,b,c) => {
    r[c] = r[a] * b
}

const banr = (r,a,b,c) => {
    r[c] = r[a] & r[b]
}
const bani = (r,a,b,c) => {
    r[c] = r[a] & b
}

const borr = (r,a,b,c) => {
    r[c] = r[a] | r[b]
}
const bori = (r,a,b,c) => {
    r[c] = r[a] | b
}

const setr = (r,a,b,c) => {
    r[c] = r[a]
}
const seti = (r,a,b,c) => {
    r[c] = a
}

const gtir = (r,a,b,c) => {
    r[c] = a > r[b] ? 1 : 0
}
const gtri = (r,a,b,c) => {
    r[c] = r[a] > b ? 1 : 0
}
const gtrr = (r,a,b,c) => {
    r[c] = r[a] > r[b] ? 1 : 0
}

const eqir = (r,a,b,c) => {
    r[c] = a === r[b] ? 1 : 0
}
const eqri = (r,a,b,c) => {
    r[c] = r[a] === b ? 1 : 0
}
const eqrr = (r,a,b,c) => {
    r[c] = r[a] === r[b] ? 1 : 0
}

const processInstruction = (register, operation, a, b, c) => {
    operation(register, a, b, c)
}

const testOperation = (register, expectedRegister, operation, a, b, c) => {
    processInstruction(register, operation, a, b, c)
    return expectedRegister.every((r,i) => {
        return register[i] == r
    })
}

assert(testOperation([3, 2, 1, 1], [3, 2, 2, 1], mulr, 2, 1, 2))
assert(testOperation([3, 2, 1, 1], [3, 2, 2, 1], addi, 2, 1, 2))
assert(testOperation([3, 2, 1, 1], [3, 2, 2, 1], seti, 2, 1, 2))
assert(!testOperation([3, 2, 1, 1], [3, 2, 2, 1], muli, 2, 1, 2))


const nextSampleData = lines => {
    const beforeRe = /Before: \[(.+), (.+), (.+), (.+)\]/
    const beforeMatch = lines[0].match(beforeRe)
    const before = [beforeMatch[1], beforeMatch[2], beforeMatch[3], beforeMatch[4]]
    lines.shift()

    const instructionRe = /(.+) (.+) (.+) (.+)/
    const instructionMatch = lines[0].match(instructionRe)
    const instruction = [instructionMatch[1], instructionMatch[2], instructionMatch[3], instructionMatch[4]]
    lines.shift()

    const afterRe = /After:  \[(.+), (.+), (.+), (.+)\]/
    const afterMatch = lines[0].match(afterRe)
    const after = [afterMatch[1], afterMatch[2], afterMatch[3], afterMatch[4]]
    lines.shift()
    lines.shift() // empty line between

    return {
        register: before.map(x => parseInt(x)),
        instruction: instruction.map(x => parseInt(x)),
        expected: after.map(x => parseInt(x))

    }
}

const operations = {
    addr, addi, 
    mulr, muli, 
    banr, bani, 
    borr, bori, 
    setr, seti, 
    gtir, gtri, gtrr, 
    eqir, eqri, eqrr
}

const countBehaviors = sample => {
    let hits = 0;
    [opcode, ...parameters] = sample.instruction
    Object.values(operations).forEach(operation => {
        const register = [...sample.register]; // reset registry, hope this is not slow
        if (testOperation(register, sample.expected, operation, ...parameters)) {
            hits++
        }
    })
    return hits
}

const behavioringOperations = sample => {
    [opcode, ...parameters] = sample.instruction;
    return Object.keys(operations).filter(key => {
        const register = [...sample.register]; 
        return testOperation(register, sample.expected, operations[key], ...parameters)
    })
}


const parseCommandLine = line => {
    const cmdRe = /(.+) (.+) (.+) (.+)/
    const cmdMatch = line.match(cmdRe)
    return [parseInt(cmdMatch[1]), parseInt(cmdMatch[2]), parseInt(cmdMatch[3]), parseInt(cmdMatch[4])]
}

getInputLines(process.argv[2]).then(lines => {
    const sampleData = []
    while (lines[0].startsWith("Before: ")) {
        sampleData.push(nextSampleData(lines))
    }

    const behaveCounts = sampleData.map(countBehaviors)
    console.log("Number of samples with more than 2 behaviors:", behaveCounts.filter(c => c >= 3).length)

    const opnamesByCode = {}
    range(16).forEach(num => {
        opnamesByCode[num] = new Set(Object.keys(operations))
    })

    sampleData.map(sample => {
        // which operations behave as the sample
        const ops = behavioringOperations(sample);
        const opSet = new Set(ops)

        // if the current known set of operation names corresponding the opcode of current
        // sample contain any other names than suitable ops found on this sample, remove them
        const current = opnamesByCode[sample.instruction[0]]
        current.forEach(cur => {
            if (!opSet.has(cur)) {
                current.delete(cur)
            }
        })
    })


    console.log(opnamesByCode)
    
    // yeah, worked this out by hand,
    // one day i will do the deduction of the orders...
    const opsInOrder = [ mulr,
        eqri,
        setr,
        eqrr,
        gtrr,
        muli,
        borr,
        bani,
        addr,
        banr,
        eqir,
        gtir,      
        addi,
        gtri,
        seti,
        bori ]
    
    lines.shift()
    lines.shift()
 
    // lets execute the program
    const register = [0, 0, 0, 0] // wonder if any values would do...
    lines.forEach(line => {
        [opIndex, ...params] = parseCommandLine(line)
//        console.log(opIndex, params)
        processInstruction(register, opsInOrder[opIndex], ...params)
        //console.log(register)
    })
    console.log("Register after program: ", register)
 })
    

