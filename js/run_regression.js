curLambdas = [
  0.05, 0.5, 5.0, 50.0
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
    var copyCat = JSON.parse(JSON.stringify(curRegressors));

    copyCat["berlin"] = copyCat["berlin"].serializeModel()
    copyCat["san-francisco"] = copyCat["san-francisco"].serializeModel()

    console.log("")
    console.log("curRegressors")
    console.log(JSON.stringify(copyCat))

    console.log("curScalers")
    console.log(JSON.stringify(curScalers))
    console.log("")
  }

  console.log("regression ...done");

  $(document).trigger("updateCityMap");
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

    if ( usedCity == "san-francisco" || usedCity == 'berlin' ) {
      XPredictor = XPredictor.toArray()
      XCorrector = XCorrector.toArray()
    }

    bestLambda = -1
    bestScore = Number.NEGATIVE_INFINITY

    curLambdas.forEach(function (curLambda) {
      if ( usedCity == "san-francisco" || usedCity == 'berlin' ) {
        var curRegression = new libsvm({
          type: libsvm.SVM_TYPES.NU_SVR,
          nu: curLambda,
          quiet: true
        });
      } else {
        var curRegression = RidgeRegression({lambda: curLambda});
      }

      curRegression.train(XPredictor, yPredictor)

      curScore = R2(curRegression, XCorrector, yCorrector);

      if ( isNaN(curScore) ) { return; }
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

    if ( usedCity == "san-francisco" || usedCity == 'berlin' ) {
      XTrain = XTrain.toArray()

      var curRegression = new libsvm({
        type: libsvm.SVM_TYPES.NU_SVR,
        nu: bestLambda,
        quiet: true
      });
    } else {
      var curRegression = RidgeRegression({lambda: bestLambda});
    }

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

    if ( usedCity == "san-francisco" || usedCity == 'berlin' ) {
      XTest = XTest.toArray()
    }

    console.log(R2(curRegression, XTest, yTest));
  }

}

$(document).on("mendedAirbnbData", runRegression);
