
const getInputLines = require('../getInputLines')
const assert = require("assert")

class RingBuffer {
    constructor() {
        this.current = null
    }

    // insert item next to current, make it new current
    insert(item) {
        if (this.current == null) {
            this.current = item
            item.next = item
            item.prev = item
        }
        else {
            item.next = this.current.next
            item.prev = this.current
            this.current.next.prev = item
            this.current.next = item
            this.current = item
        }
    }

    peekNext() {
        return this.current.next
    }

    peekPreve() {
        return this.current.prev
    }

    // remove and return current item
    take() {
        // TODO: what if taking last item 
        const item = this.current
        this.current = this.current.next
        item.prev.next = item.next
        item.next.prev = item.prev
        item.next = null
        item.prev = null
        return item
    }

    moveNext(jumps) {
        [...Array(jumps)].forEach(()=> this.current = this.current.next)
        return this.current
    }

    movePrev(jumps) {
        [...Array(jumps)].forEach(()=> this.current = this.current.prev)
        return this.current
    }

}

const parseInput = line => {
    const re = /(.+) players; last marble is worth (.+) points/
    const match = line.match(re)
    return {numPlayers: parseInt(match[1]), numMarbles: parseInt(match[2])}
}

const takeNextMarble = marbles => {
    assert(marbles.length > 0)
    return marbles.pop()
}

const switchPlayer = players => {
    return players.moveNext(1)
}

const playRound = (marbles, players, ring) => {
    const player = switchPlayer(players)
    const marble = takeNextMarble(marbles)
    if (marble.value % 23 !== 0) {
        ring.moveNext(1)
        ring.insert(marble)
    } else {
        ring.movePrev(7)
        const extra = ring.take()
        player.score = player.score + marble.value + extra.value    
    }
}

getInputLines(process.argv[2]).then(lines => {

    lines.forEach(line => {
        const {numPlayers, numMarbles} = parseInput(line)
        console.log("Lets play with ", numPlayers, "players and", numMarbles, "marbles")
    
        const players = new RingBuffer();
        [...Array(numPlayers)].forEach((x,i) => {
            const newPlayer = {
                name: i+1,
                score: 0,
            }
            players.insert(newPlayer)
        })
        const marbles = [...Array(numMarbles)].map((x,i) => ({
            value: i
        }))
        // so we can use pop instead of horribly slow shift
        marbles.reverse()
    
        const ring = new RingBuffer()
        ring.insert(takeNextMarble(marbles))

        while(marbles.length > 0) {
            playRound(marbles, players, ring)
        }
    
        const start = players.current
        let maxScore = start.score
        while (players.peekNext().name !== start.name) {
            const next = players.moveNext(1) 
            if (next.score > maxScore) {
                maxScore = next.score
            }
        }

        console.log("max score", maxScore)
        console.log(" ")
    })

}) 
