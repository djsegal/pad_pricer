function completeRun() {
  console.log("completion ...started")

  if ( Object.keys(cityMarkers).length == 0 ) {
    cityList.forEach(_completeRun);

    console.log("")
    console.log("cityMarkers")
    console.log(JSON.stringify(cityMarkers))
  }

  console.log("completion ...done");

  $(document).trigger("updateCityMap");
}

function _completeRun(usedCity) {
  console.log(usedCity);

  usedIndices = curFeatureIndices[usedCity]

  var colNames = Object.keys(cityData[usedCity].X_test);
  var curCount = Object.values(cityData[usedCity].y_test).length;

  var yExpected = yClean(cityData[usedCity].y_test);

  var curX = pickCols(cityData[usedCity].X_test, RegressorColumns, colNames)
  curX = prepareRegression(curX, cityData[usedCity].X_test, usedCity, true)
  curX = XClean(curScaler.transform(curX).transpose().to2DArray());

  curX = customTranspose(curX.toArray());
  curX = XClean(usedIndices.map(i => curX[i]));

  if ( usedCity == "san-francisco" || usedCity == 'berlin' ) {
    curX = curX.toArray()
  }

  yActual = curRegressors[usedCity].predict(curX);

  yThreshold = quantile(yActual, 0.9);

  var bestError = Number.POSITIVE_INFINITY;
  var bestLat = undefined;
  var bestLng = undefined;

  for (i = 0; i < curCount; i++) {
    if ( yExpected[i] < yThreshold ) { continue; }

    if ( cityData[usedCity].X_test.accommodates[i] != 4 ) { continue }
    if ( cityData[usedCity].X_test.bedrooms[i] != 1 ) { continue }
    if ( cityData[usedCity].X_test.bathrooms[i] != 1 ) { continue }

    tmpError = Math.abs(yActual[i] - yExpected[i]);

    if ( tmpError >= bestError ) { continue; }
    bestError = tmpError;

    bestLat = cityData[usedCity].X_test.latitude[i];
    bestLng = cityData[usedCity].X_test.longitude[i];
  }

  cityMarkers[usedCity] = [bestLat, bestLng];
}

$(document).on("regressedAirbnbData", completeRun);
