curLambdas = [
  0.05, 0.5, 5.0, 50.0
]

var needsRegression = true;

function runRegression() {
  console.log("regression ...started")

  needsRegression = (
    Object.keys(curRegressors).length == 0 ||
    Object.keys(curScalers).length == 0 ||
    Object.keys(curFeatureIndices).length == 0
  );

  cityList.forEach(_runRegression);

  if ( needsRegression ) {
    var copyCat = JSON.parse(JSON.stringify(curRegressors));

    copyCat["berlin"] = curRegressors["berlin"].serializeModel()
    copyCat["san-francisco"] = curRegressors["san-francisco"].serializeModel()

    console.log("")
    console.log("curRegressors")
    console.log(JSON.stringify(copyCat))

    console.log("")
    console.log("curFeatureIndices")
    console.log(JSON.stringify(curFeatureIndices))

    console.log("curScalers")
    console.log(JSON.stringify(curScalers))
    console.log("")
  }

  console.log("regression ...done");

  $(document).trigger("regressedAirbnbData");
}

function _runRegression(usedCity) {
  console.log(usedCity);

  var colNames = Object.keys(cityData[usedCity].X_train);

  if ( needsRegression ) {
    curScaler = StandardScaler();

    var yTrain = yClean(cityData[usedCity].y_train);

    var XTrain = pickCols(cityData[usedCity].X_train, RegressorColumns, colNames)
    XTrain = prepareRegression(XTrain, cityData[usedCity].X_train, usedCity, true)
    XTrain = XClean(curScaler.fitTransform(XTrain).transpose().to2DArray());

    curScalers[usedCity] = curScaler;
  } else {
    curScaler = curScalers[usedCity];
  }

  if ( needsRegression ) {
    prevIndices = undefined
    usedIndices = [...Array(XTrain.n).keys()];

    while ( !arraysEqual(prevIndices, usedIndices) ) {
      prevIndices = JSON.parse(JSON.stringify(usedIndices));

      XWork = customTranspose(XTrain.toArray());
      XWork = usedIndices.map(i => XWork[i]);
      XWork = XClean(XWork)

      curLasso = LASSO()
      curLasso.train(XWork, yTrain)

      workIndices = indexOfNonZero(curLasso.w, 0);
      usedIndices = workIndices.map(i => usedIndices[i]);
    }

    console.log("Features: " + XTrain.n + " -> " + usedIndices.length)
    curFeatureIndices[usedCity] = usedIndices
  } else {
    usedIndices = curFeatureIndices[usedCity]
  }

  if ( needsRegression ) {
    var yPredictor = yClean(cityData[usedCity].y_predictor);
    var yCorrector = yClean(cityData[usedCity].y_corrector);

    var XPredictor = pickCols(cityData[usedCity].X_predictor, RegressorColumns, colNames)
    XPredictor = prepareRegression(XPredictor, cityData[usedCity].X_predictor, usedCity, true)
    XPredictor = XClean(curScaler.transform(XPredictor).transpose().to2DArray());

    XPredictor = customTranspose(XPredictor.toArray());
    XPredictor = XClean(usedIndices.map(i => XPredictor[i]));

    var XCorrector = pickCols(cityData[usedCity].X_corrector, RegressorColumns, colNames)
    XCorrector = prepareRegression(XCorrector, cityData[usedCity].X_corrector, usedCity, true)
    XCorrector = XClean(curScaler.transform(XCorrector).transpose().to2DArray());

    XCorrector = customTranspose(XCorrector.toArray());
    XCorrector = XClean(usedIndices.map(i => XCorrector[i]));

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
  }

  if ( needsRegression ) {
    XTrain = customTranspose(XTrain.toArray());
    XTrain = XClean(usedIndices.map(i => XTrain[i]));

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

    XTest = customTranspose(XTest.toArray());
    XTest = XClean(usedIndices.map(i => XTest[i]));

    if ( usedCity == "san-francisco" || usedCity == 'berlin' ) {
      XTest = XTest.toArray()
    }

    console.log(R2(curRegression, XTest, yTest));
  }

}

$(document).on("mendedAirbnbData", runRegression);
