function runMender() {
  console.log("mender ...started")

  var needsRun = (
    Object.keys(cityErrorSpots).length == 0
  );

  if ( needsRun ) {
    cityList.forEach(_runMender);

    console.log("cityErrorSpots")
    console.log(JSON.stringify(cityErrorSpots))
    console.log("")
  }

  console.log("mender ...done")

  Object.values(cityErrorSpots).forEach(function (curErrorSpots, curIndex) {
    curErrorSpots = curErrorSpots.sort((a, b) => (Math.abs(a[2]) > Math.abs(b[2])) ? -1 : +1)
    curErrorSpots = curErrorSpots.slice(0,10);


    return curErrorSpots.forEach(function (curCentroid, subIndex) {
      tmpMarker = new google.maps.Marker({
        position: {lat: curCentroid[0], lng: curCentroid[1]},
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/kml/pal5/" + markerIconList[Object.values(cityHotSpots)[curIndex].length+subIndex] + ".png",
          scaledSize: new google.maps.Size(22, 22)
        },
        title: ( Math.round(100 * curCentroid[2]) + "%" )
      });

      clusterer.addMarker(tmpMarker);
    });
  });

  $(document).trigger("mendedAirbnbData");

}

function _runMender(usedCity) {
  console.log(usedCity);

  var colNames = Object.keys(cityData[usedCity].X_train);

  curScaler = StandardScaler();

  var yPredictor = yClean(cityData[usedCity].y_predictor);
  var yCorrector = yClean(cityData[usedCity].y_corrector);

  var XPredictor = pickCols(cityData[usedCity].X_predictor, RegressorColumns, colNames)
  XPredictor = prepareRegression(XPredictor, cityData[usedCity].X_predictor, usedCity)
  XPredictor = XClean(curScaler.fitTransform(XPredictor).transpose().to2DArray());

  var XCorrector = pickCols(cityData[usedCity].X_corrector, RegressorColumns, colNames)
  XCorrector = prepareRegression(XCorrector, cityData[usedCity].X_corrector, usedCity)
  XCorrector = XClean(curScaler.transform(XCorrector).transpose().to2DArray());

  var curRegression = RidgeRegression();
  curRegression.train(XPredictor, yPredictor)

  var yActual = curRegression.predict(XCorrector);
  console.log(R2(curRegression, XCorrector, yCorrector));

  curErrors = [...Array(yCorrector.length).keys()].map(function (curIndex) {
    return yCorrector[curIndex] - yActual[curIndex];
  })

  curErrors = curErrors.map(function(curError) {
    return curError / Math.max(...curErrors.map(Math.abs));
  })

  workData = {
    latitude: [],
    longitude: []
  }

  var tmpLat = Object.values(cityData[usedCity].X_corrector.latitude);
  var tmpLon = Object.values(cityData[usedCity].X_corrector.longitude);

  [...Array(yCorrector.length).keys()].forEach(function (curIndex) {
    if ( Math.abs(curErrors[curIndex]) <= 0.01 ) { return; }

    workData["latitude"].push(tmpLat[curIndex]);
    workData["longitude"].push(tmpLon[curIndex]);
  });

  curErrors = curErrors.filter(function (curError) { return Math.abs(curError) > 0.01; } )

  cityErrorSpots[usedCity] = clusterHotspots(
    usedCity, workData, curErrors
  )
}

$(document).on("learnedAirbnbData", runMender);
