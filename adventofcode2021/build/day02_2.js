"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var fs = require("fs");
var stuff = fs.readFileSync(process.argv[2]);
var lines = stuff.toString().split("\n").map(function (line) {
    var tokens = line.split(" ");
    return {
        dir: tokens[0],
        num: Number(tokens[1])
    };
});
var position = lines.reduce(function (acc, cur) {
    switch (cur.dir) {
        case 'forward': return __assign(__assign({}, acc), { hor: acc.hor + cur.num, depth: acc.depth + (acc.aim * cur.num) });
        case 'up': return __assign(__assign({}, acc), { aim: acc.aim - cur.num });
        case 'down': return __assign(__assign({}, acc), { aim: acc.aim + cur.num });
    }
}, {
    hor: 0,
    depth: 0,
    aim: 0
});
console.log(position, position.depth * position.hor);
