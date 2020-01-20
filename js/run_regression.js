curLambdas = [
  10/3, 1/3, 1/30, 100/3,
  20/3, 2/3, 2/30, 200/3,
  30/3, 3/3, 3/30, 3/300
]

var needsRegression = true;

function runRegression() {
  console.log("regression ...started")

  needsRegression = (
    Object.keys(curRegressors).length == 0 ||
    Object.keys(curScalers).length == 0
  );

  cityList.forEach(_runRegression);

  if ( needsRegression ) {
    console.log("")
    console.log("curRegressors")
    console.log(JSON.stringify(curRegressors))

    console.log("curScalers")
    console.log(JSON.stringify(curScalers))
    console.log("")
  }

  console.log("regression ...done");

  $(document).trigger("updatePrice");
}

function _runRegression(usedCity) {
  console.log(usedCity);

  var colNames = Object.keys(cityData[usedCity].X_train);

  if ( needsRegression ) {

    curScaler = StandardScaler();

    var yPredictor = yClean(cityData[usedCity].y_predictor);
    var yCorrector = yClean(cityData[usedCity].y_corrector);

    var XPredictor = pickCols(cityData[usedCity].X_predictor, RegressorColumns, colNames)
    XPredictor = prepareRegression(XPredictor, cityData[usedCity].X_predictor, usedCity, true)
    XPredictor = XClean(curScaler.fitTransform(XPredictor).transpose().to2DArray());

    var XCorrector = pickCols(cityData[usedCity].X_corrector, RegressorColumns, colNames)
    XCorrector = prepareRegression(XCorrector, cityData[usedCity].X_corrector, usedCity, true)
    XCorrector = XClean(curScaler.transform(XCorrector).transpose().to2DArray());

    bestLambda = -1
    bestScore = Number.NEGATIVE_INFINITY

    curLambdas.forEach(function (curLambda) {
      var curRegression = RidgeRegression({lambda: curLambda});
      curRegression.train(XPredictor, yPredictor)

      curScore = R2(curRegression, XCorrector, yCorrector);

      if ( curScore < bestScore ) { return; };

      bestScore = curScore;
      bestLambda = curLambda;
    })

    curScaler = StandardScaler();
    curScalers[usedCity] = curScaler;
  } else {
    curScaler = curScalers[usedCity];
  }

  if ( needsRegression ) {
    var yTrain = yClean(cityData[usedCity].y_train);

    var XTrain = pickCols(cityData[usedCity].X_train, RegressorColumns, colNames)
    XTrain = prepareRegression(XTrain, cityData[usedCity].X_train, usedCity, true)
    XTrain = XClean(curScaler.fitTransform(XTrain).transpose().to2DArray());

    var curRegression = RidgeRegression({lambda: bestLambda});
    curRegression.train(XTrain, yTrain)

    curRegressors[usedCity] = curRegression
    console.log(bestLambda)

    console.log(R2(curRegression, XTrain, yTrain));
  } else {
    curRegression = curRegressors[usedCity]
  }

  if ( needsRegression || runTestScore ) {
    var yTest = yClean(cityData[usedCity].y_test);

    var XTest = pickCols(cityData[usedCity].X_test, RegressorColumns, colNames)
    XTest = prepareRegression(XTest, cityData[usedCity].X_test, usedCity, true)
    XTest = XClean(curScaler.transform(XTest).transpose().to2DArray());

    console.log(R2(curRegression, XTest, yTest));
  }

}

$(document).on("mendedAirbnbData", runRegression);
