
const getInputLines = require('../getInputLines')
const assert = require("assert")
const utils = require("../utils")

const range = utils.range;

const combine = (elfA, elfB, board) => {
    const sum = board[elfA] + board[elfB];
    const digits = (sum + "").split("")
    digits.forEach(x => {
        board.push(parseInt(x))
    })
    return board
}


const newRecipes = (elfA, elfB, board) => {
    const sum = board[elfA] + board[elfB];
    return (sum + "").split("").map(x => parseInt(x))
}

const addAndCheck = (recipes, target, board) => {
    return recipes.some(recipe => {
        board.push(recipe)
        if (targetHasAppeared(target, board)) {
            return true
        }
        return false
    })
}

const moveElf = (elf, board) => {
    const steps = board[elf] + 1;
    let next = elf;
    range(steps).forEach(() => {
        next = next + 1 === board.length ? 0 : next + 1
    })
    return next
}

const targetHasAppeared = (target, board) => {
    for (i = 0; i < target.length; i++) {
        if (board[board.length - target.length + i] !== target[i]) {
            return false
        }
    }
    return true;
//    return board.slice(board.length - target.length).join("") === target
}

assert(targetHasAppeared([0, 1, 2, 4, 5],  [3, 7, 1, 0, 1, 0, 1, 2, 4, 5]))

const target = parseInt(process.argv[2])
const targetArr = process.argv[2].split("").map(x => parseInt(x))
console.log("targetting", target, targetArr)

let elfA = 0;
let elfB = 1;
let nextBoard = combine(elfA, elfB, [3,7])

let tick = 0;
while(true) {
    //console.log("tick", tick++)
    //console.log(nextBoard, elfA, elfB)
    elfA = moveElf(elfA, nextBoard)
    elfB = moveElf(elfB, nextBoard)
    nextBoard = combine(elfA, elfB, nextBoard)

    if (nextBoard.length >= target + 10) {
//        console.log("Ready", nextBoard, nextBoard.slice(target, target + 10).join(""))
        console.log("Ready", nextBoard.slice(target, target + 10).join(""))
        break
    }
}

elfA = 0;
elfB = 1;
nextBoard = combine(elfA, elfB, [3,7])
while(true) {
//    console.log(nextBoard, elfA, elfB)
    elfA = moveElf(elfA, nextBoard)
    elfB = moveElf(elfB, nextBoard)

    if (addAndCheck(newRecipes(elfA, elfB, nextBoard), targetArr, nextBoard)) {
        console.log(targetArr, "has appeared", nextBoard.length, nextBoard.length - targetArr.length)
        break;
    }
}



