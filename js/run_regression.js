function runRegression() {
  var usedCity = cityList[0] // REMOVE THIS!
  var curRegression = RidgeRegression()

  var colNames = Object.keys(cityData[usedCity].X_train);

  curScaler = StandardScaler();

  console.log(colNames)

  function removeCols(XData) {
    var usedCols = ["accommodates", "bathrooms", "bedrooms"];

    usedColIndices = usedCols.map(function (usedCol) {
      return colNames.indexOf(usedCol);
    });

    prunedXData = get(XData, [], usedColIndices);

    return prunedXData;
  }

  XTrain = curScaler.fitTransform(cityData[usedCity].X_train).transpose().to2DArray();
  var XTrain = removeCols(XClean(XTrain));
  var yTrain = yClean(cityData[usedCity].y_train);

  curRidge = RidgeRegression()
  curRidge.train(XTrain, yTrain)

  console.log(R2(curRidge, XTrain, yTrain));

  XTest = curScaler.transform(cityData[usedCity].X_test).transpose().to2DArray();
  var XTest = removeCols(XClean(XTest));
  var yTest = yClean(cityData[usedCity].y_test);

  console.log(R2(curRidge, XTest, yTest));
}

$(document).on("loadedAirbnbData", runRegression);
