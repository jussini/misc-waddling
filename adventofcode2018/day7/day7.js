
const getInputLines = require('../getInputLines')
const assert = require("assert")

const createStep = name => {
    return {
        name: name,
        prequisites: [],
        enabled: [],
        workPrequisites: [],
        state: "IDLE" // "WORK", "DONE"
    }
}

const isAvailable = step => {
    return step.prequisites.length == 0
}

const addPrequisite = (step, prequisite) => {
    step.prequisites.push(prequisite)
    step.workPrequisites.push(prequisite)
}

const removePrequisitesFromChildren = step => {
    step.enabled.forEach(enabledStep => {
        removePrequisite(enabledStep, step)
    })
}

const removePrequisite = (step, prequisite) => {
    step.prequisites = step.prequisites.filter(s => s.name !== prequisite.name)
}

const addEnabled = (step, enabled) => {
    step.enabled.push(enabled);
}

const sortNodes = nodes => {
    return nodes.sort((a,b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0))
}

const addNodesToGraph = (stepName, prequisiteStepName, graph) => {
    const step = graph[stepName] || createStep(stepName);
    const prequisiteStep = graph[prequisiteStepName] || createStep(prequisiteStepName)
    addPrequisite(step, prequisiteStep)
    addEnabled(prequisiteStep, step)
    graph[stepName] = step
    graph[prequisiteStepName] = prequisiteStep
    return graph
}

const parseLinesToGraph = lines => {
    const re = /Step (.+) must be finished before step (.+) can begin./
    return lines.reduce((graph, line) => {
        const match = line.match(re);
        const prequisiteStepName = match[1]
        const stepName = match[2]

        return addNodesToGraph(stepName, prequisiteStepName, graph);

    }, {})
}

const findAndRemoveFirstAvailable = queue => {

    const index = queue.findIndex(isAvailable);
    if (index == -1) {
        console.warn("Not suitable items in queue", queue)
    }  
    assert(index != -1) // yeah, u better be

    const removed = queue.splice(index,1);
    assert(removed.length === 1) // yah, shit will break otherwise
    return removed[0];
}

const createBacklog = queue => {
    const finished = []

    // start working through the queue, from the start. Find the first item that does not
    // have any prequisites left, move it to the end of finished list and remove it from 
    // it's children's prequisites. Rinse and repeat.
    while (queue.length > 0) {
        const step = findAndRemoveFirstAvailable(queue);
        removePrequisitesFromChildren(step)
        finished.push(step);
    }
    return finished;
}

const addTimesToFinish = items => {
    // each item takes 60 + itemname
    return items.forEach(item => {
        item.timeLeft = 60 + item.name.charCodeAt(0) - 64 // because "A" is 65
    })
}

const createWorker = name => ({
    name,
    workingOn: null
})

const printWorkers = (second, workers, done) => {
    const pad = [...Array(5 - (""+second).length)].map(() => " ").join("")
    console.log(pad+second, workers.map(w => {
        if (w.workingOn !== null) {
            return w.workingOn.name
        }
        return "."
    }), done.join(""))
}

const doWork = workers => {
    workers.forEach(worker => {
        if (worker.workingOn !== null) {
            worker.workingOn.timeLeft = worker.workingOn.timeLeft - 1
        }
    })
}

getInputLines(process.argv[2]).then(lines => {

    const graph = parseLinesToGraph(lines)
    const queue = sortNodes(Object.values(graph))
    const backlog = createBacklog(queue);
    console.log("Part 1 backlog", backlog.map(step => step.name).join(""))
    console.log("")

    addTimesToFinish(backlog)
    let second = 0
    const workers = [
        createWorker(1), 
        createWorker(2),
        createWorker(3),
        createWorker(4),
        createWorker(5)
    ]
    const finished = []

    console.log("Part 2 backlog finishing")
    while(backlog.length > finished.length) {

        // has any work been completed?
        const completedTasks = backlog.filter(bli => bli.state === "WORK" && bli.timeLeft === 0)
        if (completedTasks.length > 0) {
            completedTasks.forEach(completed => {
                completed.worker.workingOn = null // free the little dude
                completed.state = "DONE"
                finished.push(completed.name)
            })            
        }

        workers.forEach(worker => {
            const nextStep = backlog.find(s => {
                return s.state === "IDLE" &&
                       s.workPrequisites.every(wp => finished.indexOf(wp.name) !== -1)
            })
            if (worker.workingOn == null &&  nextStep !== undefined) {
                worker.workingOn = nextStep
                nextStep.state = "WORK"
                nextStep.worker = worker
            }            
        })
        printWorkers(second, workers, finished)
        doWork(workers)
        second = second + 1;
    }

}) 
