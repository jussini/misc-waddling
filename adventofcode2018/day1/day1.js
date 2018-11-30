
function processFile(inputFile) {

    const fs = require('fs');
    const readline = require('readline');
    const instream = fs.createReadStream(inputFile);
    const outstream = new (require('stream'))();
    const rl = readline.createInterface(instream, outstream);

    var sum = 0;


    rl.on('line', function (line) {
        sum = sum + parseInt(line);
        console.log("line:", line, parseInt(line), sum);
    });
    
    rl.on('close', function (line) {
        console.log('done reading file:', sum);
    });
}

processFile(process.argv[2]); // 0 node, 1 day1.js, 2 inputfile

