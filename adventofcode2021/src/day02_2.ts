import * as fs from 'fs'

const stuff = fs.readFileSync(process.argv[2])
const lines = stuff.toString().split("\n").map((line) => {
    const tokens = line.split(" ")
    return {
        dir: tokens[0],
        num: Number(tokens[1])
    }
})


const position = lines.reduce((acc, cur) => {
  switch(cur.dir) {
      case 'forward': return {...acc, hor: acc.hor + cur.num, depth: acc.depth + (acc.aim * cur.num) }
      case 'up': return {...acc, aim: acc.aim - cur.num}
      case 'down': return {...acc, aim: acc.aim + cur.num}
  }
}, {
 hor: 0,
 depth: 0,
 aim: 0
})

console.log(position, position.depth * position.hor)
