
const getInputLines = require('../getInputLines')
const assert = require("assert")
const utils = require("../utils")

const range = utils.range;

const parseInitialState = line => {
    const re = /initial state: (.+)/ 
    const stateLine = line.match(re)[1]
    return stateLine.split("").map((plant, number) => ({plant, number})) 
}

const parseRules = lines => {
    const re = /(.+) => (.+)/
    return lines.map(line => {
        const match = line.match(re)
        return {
            rule: match[1],
            result: match[2]
        }
    })
}

const statePattern = (state, index) => {
    return []
        .concat(
            state.slice(index -2, index), 
            state[index],
            state.slice(index +1, index + 3))
        .map(pod => pod.plant)
        .join("");
}


// add some empty pots around the state to ensure we can match
const padState = state => {
    let padded = state
    // we want to have at least enough empty pots before the first
    const firstFlowerIndex = padded.findIndex(pot => pot.plant === "#");
    const leftPad = Math.max(0, 3 - firstFlowerIndex)
    range(leftPad).forEach(() => {
        padded.splice(0,0,{
            number: padded[0].number - 1,
            plant: "."
        })
    })

    const lastFlower = utils.findLastIndex(padded, pot => pot.plant === "#");
    assert(lastFlower !== -1)
    const rightPad = Math.max(0, 3 - (padded.length - 1 - lastFlower))
    range(rightPad).forEach(() => {
        padded.push({
            number: padded[padded.length -1].number + 1,
            plant: "."
        })
    })

    return padded
}

console.log("pad test", padState([{number: 0, plant: "#"}]))

const ruleMatchesAt = (rule, state, at) => {
    const snip = statePattern(state, at);
    return  snip == rule
}

const nextState = (currentState, rules) => {
    return currentState.map((pod, index) => {
        if (index < 2 || index > currentState.length -3 ) {
            return pod;
        }
        const rule = rules.find(rule => ruleMatchesAt(rule.rule, currentState, index))
        if (rule !== undefined) {
            return {
                plant: rule.result,
                number: pod.number,
            }
        }
        // we should not get here, at least one of the rules should match
        //assert(false)
        return {
            plant: ".",
            number: pod.number,
        }

    })
}


const breed = (initialState, generations, rules) => {
    let state = padState(initialState);
    console.log(0, ":", printState(state))
    for (let i = 1; i < generations + 1; i++ ) {
        const numBefore = addFlowerPots(state)
        state = padState(nextState(state, rules))
        const numAfter = addFlowerPots(state)
        console.log(i, ":", printState(state), numAfter, numAfter - numBefore)
    }
    return state
}

const printState = state => {
    return state.map(pod => pod.plant).join("");
}

const addFlowerPots = state => {
    const podsWithFlowers = state.filter(pod => pod.plant === "#");
    return podsWithFlowers.reduce((acc, pod) => {
        return acc + pod.number;
    }, 0)
}

getInputLines(process.argv[2]).then(lines => {

    const initialState = parseInitialState(lines[0])
    console.log(initialState)

    // remove initial state and emptyline 
    lines.shift()
    lines.shift()

    const rules = parseRules(lines)
    console.log(rules)
 
    const afterGenerations = breed(initialState, 20, rules)

    console.log("After generations:\n", printState(afterGenerations))
    
    console.log("Part 1 Pod numbers", addFlowerPots(afterGenerations))


    //const afterGenerations2 = breed(initialState, 50000000000, rules)
    // After 162, number grows by 23 on every generation
    const afterGenerations2 = breed(initialState, 200, rules)

   // after 200: 4958 => after 50000000000: 4958 + (50000000000 - 200) * 23

})
    

