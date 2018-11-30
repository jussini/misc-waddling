
function processFile(inputFile) {

    const fs = require('fs');
    const readline = require('readline');
    const instream = fs.createReadStream(inputFile);
    const outstream = new (require('stream'))();
    const rl = readline.createInterface(instream, outstream);

    const allLines = [];

    rl.on('line', function (line) {
        allLines.push(line);
    });
    
    rl.on('close', function () {
        const fitting = allLines.filter(line => {
            return allLines.some(anotherLine => sameEnough(line, anotherLine))
        });
        console.log("fitting", fitting, common(fitting[0], fitting[1]));
    });
}

function common(first, second) {
    return first.split("").reduce((acc, cur, idx) => {
        if (cur == second[idx]) {
            return acc.concat(cur);
        }
        return acc.concat("")
    }, "")
}

// first and second are same enough, if they
// differ only by one character, at the same spot
function sameEnough(first, second) {
    // lets go brute forcing, check each character at a time, and they may
    // differ at max once
    let index = 0;
    let differences = 0;
    while(differences <= 1 && index < first.length) {
        if (first[index] != second[index]) {
            differences++;
        }
        index++;
    }
    return differences === 1;
}


processFile(process.argv[2]); // 0 node, 1 day1.js, 2 inputfile

