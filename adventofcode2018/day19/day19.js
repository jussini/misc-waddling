
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

const processInstruction = (register, ip, ipreg, operation, a, b, c) => {
    register[ipreg] = ip
    operation(register, a, b, c)
    return register[ipreg] + 1
}

const operations = {
    "addr": addr, "addi": addi, 
    "mulr": mulr, "muli": muli, 
    "banr": banr, "bani": bani, 
    "borr": borr, "bori": bori, 
    "setr": setr, "seti": seti, 
    "gtir": gtir, "gtri": gtri, "gtrr": gtrr, 
    "eqir": eqir, "eqri": eqri, "eqrr": eqrr
}

const parseIPLine = line => {
    const re = /#ip (.+)/
    const match = line.match(re)
    return parseInt(match[1])
}

const parseInstruction = line => {
    const re = /(.+) (.+) (.+) (.+)/
    const match = line.match(re);
    [full, opname, ...params] = match
    return {
        operation: operations[opname],
        params: params.map(p => parseInt(p))
    }
}

getInputLines(process.argv[2]).then(lines => {
 

    const ipreg = parseIPLine(lines[0])
    lines.shift()
    const program = lines.map(parseInstruction);

    let register = [0, 0, 0, 0, 0, 0]
    let ip = 0
    while(ip <= program.length -1) {
        //console.log(ip, register)
        const instruction = program[ip]
        ip = processInstruction(register, ip, ipreg, instruction.operation, ...instruction.params)
    }
    console.log("After program 1, register", register)


    // setting reg0 to 1 will branch the setup so that r4 gets quite large, in this case
    // to 10551358

    // the program actually finds out the sum of all factors of r4, and that sum is in r0 at the end
    // of the program.
    // however, because the implementation is horribly slow, it will not finish like, ever.
    // anyhow, factors of 10551358: 1, 2, 5275679, 10551358 => sum is 15827040
    /*
    register = [1, 0, 0, 0, 0, 0]
    ip = 0
    while(ip <= program.length -1) {
        console.log(ip, register)
        const instruction = program[ip]
        ip = processInstruction(register, ip, ipreg, instruction.operation, ...instruction.params)
    }
    */
 })
    
