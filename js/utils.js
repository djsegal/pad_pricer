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
