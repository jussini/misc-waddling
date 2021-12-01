import * as fs from 'fs'

const stuff = fs.readFileSync(process.argv[2])
const lines: number[] = stuff.toString().split("\n").map(Number)

const windowSum = (arr: number[], i: number) => arr.slice(i, i+3).reduce((a,c) => a + c, 0)

const count = lines.reduce((acc, _, i, arr) => {
  const cur = windowSum(arr, i)
  return cur > acc.prev ? { count: acc.count + 1, prev: cur} : {...acc, prev: cur}
}, {
 count: 0,
 prev: windowSum(lines, 0)
})

console.log(count.count)
