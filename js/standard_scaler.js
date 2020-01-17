function StandardScaler(name) {
  const curScaler = {};

  curScaler.means = [];
  curScaler.stdDevs = [];

  curScaler.transform = function(XData) {
    var cleanedData = new ML.Matrix(_XClean(XData));

    for (var i = 0; i < cleanedData.columns; i++) {
      var curCol = cleanedData.getColumn(i);

      stdDev = curScaler.stdDevs[i];
      mean = curScaler.means[i];

      curCol = curCol.map(function(curVal) { return ( curVal - mean ) / stdDev });
      cleanedData.setColumn(i, curCol)
    }

    return cleanedData;
  };

  curScaler.inverseTransform = function(XData) {
    if ( typeof XData.getColumn === 'function' ) {
      console.log("!!!")
      var cleanedData = XData;
    } else {
      var cleanedData = new ML.Matrix(_XClean(XData));
    }

    for (var i = 0; i < cleanedData.columns; i++) {
      var curCol = cleanedData.getColumn(i);

      stdDev = curScaler.stdDevs[i];
      mean = curScaler.means[i];

      curCol = curCol.map(function(curVal) { return mean + curVal * stdDev });
      cleanedData.setColumn(i, curCol)
    }

    return cleanedData;
  };

  curScaler.fit = function(XData) {
    var cleanedData = new ML.Matrix(_XClean(XData));

    for (var i = 0; i < cleanedData.columns; i++) {
      var curCol = cleanedData.getColumn(i);

      curScaler.stdDevs.push(ML.Array.standardDeviation(curCol));
      curScaler.means.push(ML.Array.mean(curCol));
    }

    return curScaler;
  };

  curScaler.fitTransform = function(XData) {
    curScaler.fit(XData);
    return curScaler.transform(XData);
  };

  return curScaler;
}
