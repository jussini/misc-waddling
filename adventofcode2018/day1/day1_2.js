
function processFile(inputFile) {

    const fs = require('fs');
    const readline = require('readline');
    const instream = fs.createReadStream(inputFile);
    const outstream = new (require('stream'))();
    const rl = readline.createInterface(instream, outstream);

    const allLines = [];

    rl.on('line', function (line) {        
        allLines.push(parseInt(line));
    });
    
    rl.on('close', function (line) {
        findDuplicate(allLines)
    });
}

function findDuplicate(lines) {
    let sum = 0;
    let times = 1;
    const freqs = new Set([0])
    let searchingDuplicate = true;

    while(searchingDuplicate) {
        console.log("run #", times)
        lines.forEach(line => {
          sum = sum + line;
          if (searchingDuplicate && freqs.has(sum)) {
            console.log("Found duplicate", sum, "on run #", times);
            searchingDuplicate = false;
            return; 
          } 
          freqs.add(sum);
        });
        times = times +1
    }


}

processFile(process.argv[2]); // 0 node, 1 day1.js, 2 inputfile

