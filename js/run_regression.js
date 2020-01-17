function runRegression() {
  var usedCity = cityList[0] // REMOVE THIS!
  var curRegression = RidgeRegression()

  var colNames = Object.keys(cityData[usedCity].X_train);

  regressor_columns = ["accommodates", "bathrooms", "bedrooms"];

  curScaler = StandardScaler();

  XTrain = curScaler.fitTransform(cityData[usedCity].X_train).transpose().to2DArray();
  var XTrain = XClean(pickCols(XTrain, regressor_columns, colNames));
  var yTrain = yClean(cityData[usedCity].y_train);

  curRidge = RidgeRegression()
  curRidge.train(XTrain, yTrain)

  console.log(R2(curRidge, XTrain, yTrain));

  XTest = curScaler.transform(cityData[usedCity].X_test).transpose().to2DArray();
  var XTest = XClean(pickCols(XTest, regressor_columns, colNames));
  var yTest = yClean(cityData[usedCity].y_test);

  console.log(R2(curRidge, XTest, yTest));
}

$(document).on("loadedAirbnbData", runRegression);
