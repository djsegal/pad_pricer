curRegressors = {};
curScalers = {};

function runRegression() {
  console.log("regression ...started")
  cityList.forEach(_runRegression);
  console.log("regression ...done")

  $(document).trigger("updatePrice");
}

function _runRegression(usedCity) {
  console.log(usedCity);

  var colNames = Object.keys(cityData[usedCity].X_train);

  curScaler = StandardScaler();
  curScalers[usedCity] = curScaler;

  var XTrain = pickCols(cityData[usedCity].X_train, RegressorColumns, colNames)
  XTrain.push(
    curLearners[usedCity].predict(prepareLearner(cityData[usedCity].X_train, usedCity))
  )

  XTrain = XClean(curScaler.fitTransform(XTrain).transpose().to2DArray());
  var yTrain = yClean(cityData[usedCity].y_train);

  var curRegression = RidgeRegression();
  curRegression.train(XTrain, yTrain)

  console.log(R2(curRegression, XTrain, yTrain));

  var XTest = pickCols(cityData[usedCity].X_test, RegressorColumns, colNames)
  XTest.push(
    curLearners[usedCity].predict(prepareLearner(cityData[usedCity].X_test, usedCity))
  )

  XTest = XClean(curScaler.transform(XTest).transpose().to2DArray());
  var yTest = yClean(cityData[usedCity].y_test);

  console.log(R2(curRegression, XTest, yTest));

  curRegressors[usedCity] = curRegression
}

$(document).on("learnedAirbnbData", runRegression);
