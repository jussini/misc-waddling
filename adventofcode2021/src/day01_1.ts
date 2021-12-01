import * as fs from 'fs'

const stuff = fs.readFileSync(process.argv[2])
const lines: Number[] = stuff.toString().split("\n").map(Number)

const count = lines.reduce((acc, cur) => {
  return cur > acc.prev ? { count: acc.count + 1, prev: cur} : {...acc, prev: cur}
}, {
 count: 0,
 prev: lines[0]   
})

console.log(count.count)
