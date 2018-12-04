
const getInputLines = require('../getInputLines')

const getTimestamp = match => ({
    timestamp: Date.parse(match[1]),
    year: parseInt(match[2]),
    month: parseInt(match[3]),
    day: parseInt(match[4]),
    hour: parseInt(match[5]),
    minute: parseInt(match[6]),
})

const logLine = line => {
    const guardRegex = /\[((.*)-(.*)-(.*) (.*):(.*))\] Guard #(.*) begins shift/;
    const sleepRegex = /\[((.*)-(.*)-(.*) (.*):(.*))\] falls asleep/;
    const wakeRegex = /\[((.*)-(.*)-(.*) (.*):(.*))\] wakes up/;

    const guardMatch = guardRegex.exec(line);
    if (guardMatch !== null) {
        return {
            ...getTimestamp(guardMatch),
            type: "guard",
            guard: guardMatch[7]
        }
    }

    const sleepMatch = sleepRegex.exec(line);
    if (sleepMatch !== null) {
        return {
            ...getTimestamp(sleepMatch),
            type: "sleep"
        }
    }

    const wakeMatch = wakeRegex.exec(line);
    if (wakeMatch !== null) {
        return {
            ...getTimestamp(wakeMatch),
            type: "wake"
        }
    }
    console.warn("you should not be here, silly girl!")
}

const logLineCompare = (a,b) => {
    return a.timestamp - b.timestamp;
}

const guardSleepReducer = (schedule, logLine) => {
    if (logLine.type === "guard") {
        schedule.push({
            id: logLine.guard,
            minutes: [...Array(60).keys()].map(x => ".") // by default awake
        })
    } 

    const item = schedule[schedule.length -1];
    if (logLine.type === "sleep") {
        item.lastSleep = logLine.minute;
    }

    if (logLine.type === "wake") {
        for (let i = item.lastSleep; i < logLine.minute; i++) {
            item.minutes[i] = "#";
        }
    }

    return schedule;
}

const byGuardReducer = (guards, shift) => {
    const guard = guards[shift.id] || {shifts: [], sleepMinutes: 0};
    guard.shifts.push(shift.minutes)
    guard.id = shift.id
    guard.sleepMinutes = guard.sleepMinutes + shift.minutes.filter(m => m == "#").length
    guards[shift.id] = guard
    return guards
}

const getGuardWithMostSleep = shiftsByGuard => {
    const sleepAmountReducer = (sleepiest, key) => {
        const guard = shiftsByGuard[key]
        if (guard.sleepMinutes > sleepiest.sleepMinutes) {
            return guard
        }
        return sleepiest
    }
    return Object.keys(shiftsByGuard).reduce(sleepAmountReducer, {id: null, sleepMinutes: 0})
}

const sleepFreqReducer = (sleepFreq, shift) => {
    shift.forEach((minute, index) => {
        if (minute === "#") {
            sleepFreq[index] = sleepFreq[index] + 1
        }
    })
    return sleepFreq
}

const sleepiestMinuteReducer = (sleepiestMinute, cur, curMinute, sleepFreqs) => {
    if (cur > sleepFreqs[sleepiestMinute]) {
        return curMinute
    }
    return sleepiestMinute;
}

const getSleepFreqs = shiftsByGuard => {
    return Object.keys(shiftsByGuard).map(guardId => {
        return {
            id: guardId,
            freqs: shiftsByGuard[guardId].shifts.reduce(sleepFreqReducer, [...Array(60)].map(x => 0))
        }
    })
}

getInputLines(process.argv[2]).then(lines => {
    const logLines = lines.map(logLine);
    const sorted = logLines.sort(logLineCompare);
    const schedule = sorted.reduce(guardSleepReducer, []);

    const shiftsByGuard = schedule.reduce(byGuardReducer, {})
    const guardWithMostSleep = getGuardWithMostSleep(shiftsByGuard)
    console.log("guard with most sleep minutes", guardWithMostSleep.id, guardWithMostSleep.sleepMinutes)
    const sleepFreqs = guardWithMostSleep.shifts.reduce(sleepFreqReducer, [...Array(60)].map(x => 0))
    const sleepiestMinute = sleepFreqs.reduce(sleepiestMinuteReducer, 0)

    console.log("sleepiest minute of guard", guardWithMostSleep.id, ":", sleepiestMinute, "answer", sleepiestMinute * guardWithMostSleep.id)

    // part 2 lets make sleepfreqs for each guard, and find who has the largest value
    const sleepFreqsOfAll = getSleepFreqs(shiftsByGuard)

    const mostFrequentlyAsleep = sleepFreqsOfAll.reduce((sleepiest, cur) => {
        if (Math.max(...cur.freqs) > Math.max(...sleepiest.freqs) ) {
            return cur;
        }
        return sleepiest;
    }, {freqs: []})
    const part2Guard = mostFrequentlyAsleep.id
    const part2SleepiestMinute = mostFrequentlyAsleep.freqs.reduce(sleepiestMinuteReducer, 0)
    console.log("part 2 answer, guard", part2Guard, "minute", part2SleepiestMinute, "=>", part2Guard * part2SleepiestMinute)

}) 

