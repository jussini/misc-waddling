
const fs = require('fs');
const readline = require('readline');

const getInputLines = filename => {

    return new Promise(function(resolve, reject) {

        const instream = fs.createReadStream(filename);
        const outstream = new (require('stream'))();
        const rl = readline.createInterface(instream, outstream);
    
        const allLines = [];
    
        rl.on('line', function (line) {
            allLines.push(line);
        });
        
        rl.on('close', function (line) {
            resolve(allLines);
        });

    })
}

module.exports = getInputLines;