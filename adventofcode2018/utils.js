const range = (num, start = 0, jump = 1) => [...Array(num)].map((x,i) => (i*jump) + start)
module.exports.range = range

const findLastIndex = (array, predicate) => {
	for (let i = array.length - 1; i >= 0; --i) {
		const x = array[i];
		if (predicate(x)) {
			return i;
		}
    }
    return -1;
}
module.exports.findLastIndex = findLastIndex;