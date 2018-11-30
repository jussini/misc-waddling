
function processFile(inputFile) {

    const fs = require('fs');
    const readline = require('readline');
    const instream = fs.createReadStream(inputFile);
    const outstream = new (require('stream'))();
    const rl = readline.createInterface(instream, outstream);

    const allLines = [];

    rl.on('line', function (line) {
        allLines.push(dupesAndTripes(line));                
    });
    
    rl.on('close', function (line) {
        const numDupes = allLines.filter(pair => pair[0]).length;
        const numTripes = allLines.filter(pair => pair[1]).length;
        console.log(numDupes, numTripes, numDupes * numTripes);
    });
}

function hasDupes(freqList) {
    return freqList.some(i => i[1] === 2)
}

function hasTripes(freqList) {
    return freqList.some(i => i[1] === 3)
}


function dupesAndTripes(line) {
    const initial = new Map();
    const charFreqs = line
      .split('')
      .reduce((acc, char) => {
        if (acc.has(char)) {
            acc.set(char, acc.get(char) + 1);
        } else {
            acc.set(char, 1)
        }
        return acc;
      }, initial)
      .entries() // for map, list of [key,value] pairs

      const asArray = Array.from(charFreqs);
      return [hasDupes(asArray), hasTripes(asArray)]      
}

processFile(process.argv[2]); // 0 node, 1 day1.js, 2 inputfile

