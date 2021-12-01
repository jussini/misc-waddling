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
var lines = stuff.toString().split("\n").map(Number);
var windowSum = function (arr, i) { return arr.slice(i, i + 3).reduce(function (a, c) { return a + c; }, 0); };
var count = lines.reduce(function (acc, _, i, arr) {
    var cur = windowSum(arr, i);
    return cur > acc.prev ? { count: acc.count + 1, prev: cur } : __assign(__assign({}, acc), { prev: cur });
}, {
    count: 0,
    prev: windowSum(lines, 0)
});
console.log(count.count);
