function _XClean(XData) {
    var values = Object.keys(XData).map(function(curKey){
        return Object.keys(XData[curKey]).map(function(subKey){
            return XData[curKey][subKey];
        });
    });

    return customTranspose(values);
}

function XClean(XData) {
  return array2mat(_XClean(XData));
};

function yClean(yData) {
  return Object.keys(yData).map(function(curKey){
      return Math.log10(yData[curKey]);
  });
};
