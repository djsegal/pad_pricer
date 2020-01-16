const average = (array) => array.reduce((a, b) => a + b) / array.length;
const custom_transpose = array => array[0].map((r, i) => array.map(c => c[i]));

function _XClean(XData) {
    var values = Object.keys(XData).map(function(curKey){
        return Object.keys(XData[curKey]).map(function(subKey){
            return XData[curKey][subKey];
        });
    });

    return custom_transpose(values);
}

function XClean(XData) {
  return array2mat(_XClean(XData));
};

function yClean(yData) {
  return Object.keys(yData).map(function(curKey){
      return Math.log10(yData[curKey]);
  });
};

function R2(curRidge, XData, yData) {
  yAverage = average(yData);
  yPredict = curRidge.predict(XData);

  ssRes = 0.0
  ssTot = 0.0

  for (var i = 0; i < XData.length; i++) {
    ssRes += Math.pow( yData[i] - yPredict[i] , 2 )
    ssTot += Math.pow( yData[i] - yAverage , 2 )
  }

  curScore = 1 - ssRes / ssTot;

  return curScore;
}
