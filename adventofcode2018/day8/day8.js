
const getInputLines = require('../getInputLines')
const assert = require("assert")


const createNodeFrom = inputList => {
//    console.log("create node from ", inputList)
    const childrenSize = inputList[0]
    const metadataSize = inputList[1]
    let rest = inputList.slice(2);
    const children = [];
    [...Array(childrenSize)].forEach(() => {
        const childAndRest = createNodeFrom(rest);
        children.push(childAndRest.child)
        rest = childAndRest.rest
    })

    const metadata = rest.slice(0, metadataSize) //rest.slice(0, metadataSize);
    rest = rest.slice(metadataSize)

    return {
        child: {
            children,
            metadata
        },
        rest
    }

}

const parseTree = input => {
    const inputList = input.split(" ").map(i => parseInt(i))
    return createNodeFrom(inputList);
}

const printTree = tree => {
    const printTreeInner = (tree, indent) => {
        console.log(indent, "- metadata:", tree.metadata )
        console.log(indent, "  children:", tree.children.length)
        tree.children.map(node => printTreeInner(node, indent + "  "))
    }
    printTreeInner(tree, "")
}

const metadataSum = tree => {
    const nodeSum = tree.metadata.reduce((sum, cur) => {
        return sum + cur
    }, 0)
    const childrenSum = tree.children.reduce((sum, cur) => {
        return sum + metadataSum(cur)     
    }, 0)
    return nodeSum + childrenSum
}

const complicatedMetadataSum = tree => {
    if (tree.children.length === 0) {
        return tree.metadata.reduce((sum, cur) => {
            return sum + cur
        }, 0);
    }

    return tree.metadata
        .map(md => {
            if (md === 0 || md -1 >= tree.children.length) {
                return 0
            }
            return complicatedMetadataSum(tree.children[md - 1])})
        .reduce((sum, cur) => sum + cur, 0)
}

getInputLines(process.argv[2]).then(lines => {

    const tree = parseTree(lines[0])
    // full input should be consumed
    assert(tree.rest.length === 0)
//    printTree(tree.child)
    console.log("Part 1 metadata sum", metadataSum(tree.child))
    console.log("Part 2 complicated metadata sum", complicatedMetadataSum(tree.child))


}) 
