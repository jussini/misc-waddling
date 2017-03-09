//
// My go a the Gateway Technolabs code challenge, Feb 2017
//
// Given an integer n, print a character square so that in the middle
// stands the nth alphabet surrouned by the rest
// For example, given n=3, will print
// 
// AAAAA
// ABBBA
// ABCBA
// ABBBA
// AAAAA
//
// Or given n=2:
//
// AAA
// ABA
// AAA

const constructCharSquare = (char, depth) => {
    if (depth <= 1) {
	return [char];
    }
    const nextChar = String.fromCharCode(char.charCodeAt() + 1);
    return wrapSquare(char, constructCharSquare(nextChar, depth - 1));
}

const wrapSquare = (wrapChar, square) => {
    const newSquare = square.map(row => wrapChar + row + wrapChar);
    const newRow = wrapChar.repeat(newSquare[0].length);
    return [newRow].concat(newSquare, newRow);
}

const printSquare = square => {
    square.forEach(r => console.log(r));
}

printSquare(constructCharSquare('A', 2))
console.log('')
printSquare(constructCharSquare('A', 3))

// printSquare(constructCharSquare('a', 26));
