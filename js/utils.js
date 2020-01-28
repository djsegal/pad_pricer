const average = (array) => array.reduce((a, b) => a + b) / array.length;
const customTranspose = array => array[0].map((r, i) => array.map(c => c[i]));

function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

function decamelize(str, separator){
  separator = typeof separator === 'undefined' ? '_' : separator;

  return str
        .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
        .toLowerCase();
}

const indexOfZero = (arr) => arr.reduce((acc, el, i) => (Math.abs(el) < 3e-3 ? [...acc, i] : acc), []);
const indexOfNonZero = (arr) => [...Array(arr.length).keys()].filter(e => !indexOfZero(arr).includes(e))

function arraysEqual(a1,a2) {
    if (typeof a1 === "undefined") { return false; }
    if (typeof a2 === "undefined") { return false; }

    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}
