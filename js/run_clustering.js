function runClustering() {
  console.log("clustering ...started")

  var needsRun = (
    Object.keys(cityBounds).length == 0 ||
    Object.keys(cityHotSpots).length == 0
  );

  if ( needsRun ) {
    cityList.forEach(_runClustering);

    console.log("")
    console.log("cityBounds")
    console.log(JSON.stringify(cityBounds))

    console.log("cityHotSpots")
    console.log(JSON.stringify(cityHotSpots))
    console.log("")
  }

  console.log("clustering ...done")

  Object.values(cityHotSpots).forEach(function (curHotSpots) {
    curHotSpots = curHotSpots.sort((a, b) => (a[2] > b[2]) ? -1 : +1)
    curHotSpots = curHotSpots.slice(0,10);

    return curHotSpots.forEach(function (curCentroid, curIndex) {
      new google.maps.Marker({
        position: {lat: curCentroid[0], lng: curCentroid[1]},
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/kml/paddle/" + (curIndex+1) + "-lv.png",
          scaledSize: new google.maps.Size(22, 22)
        },
        title: (curCurrency + Math.round(2*Math.pow(10, curCentroid[2])))
      });
    });
  });

  $(document).trigger("updateCityMap");
  $(document).trigger("clusteredAirbnbData");
}

function _runClustering(usedCity) {
  console.log(usedCity);

  var colNames = Object.keys(cityData[usedCity].X_train);

  kmeans_columns = ["latitude", "longitude"];

  clusterData = pickCols(
    cityData[usedCity].X_train, kmeans_columns, colNames
  );

  cityBounds[usedCity] = {
    minLat: ML.Array.min(clusterData[0]),
    maxLat: ML.Array.max(clusterData[0]),
    minLon: ML.Array.min(clusterData[1]),
    maxLon: ML.Array.max(clusterData[1])
  }

  const pca = new ML.PCA(customTranspose(clusterData), {scale: true});

  clusterData = pca.predict(
    customTranspose(clusterData)
  ).transpose().to2DArray();

  curScaler = StandardScaler();

  clusterTarget = Object.values(cityData[usedCity].y_train);
  otherTarget = Object.values(cityData[usedCity].X_train["accommodates"]);

  for (var i = 0; i < clusterTarget.length; i++) {
    clusterTarget[i] /= Math.sqrt(otherTarget[i]);
    clusterTarget[i] = Math.log10(clusterTarget[i]);
  }

  clusterData.push(clusterTarget);

  clusterData = curScaler.fitTransform(clusterData).to2DArray()

  // City Center

  var curK = 1;
  var curKMeans = ML.KMeans(clusterData, curK);

  curCentroid = curScaler.inverseTransform(customTranspose(
    curKMeans.centroids.map(
      function (curCentroid) { return curCentroid.centroid }
    )
  )).to2DArray()[0];

  var curLatLon = pca.invert(
    [[curCentroid[0], curCentroid[1]]]
  ).to2DArray()[0];

  cityBounds[usedCity]['centerLat'] = curLatLon[0];
  cityBounds[usedCity]['centerLon'] = curLatLon[1];

  map.setCenter({lat: curLatLon[0], lng: curLatLon[1]})

  // Hot Spots

  geoClusterData = clusterData.map(function (curRow) {
    return [curRow[0], curRow[1]];
  })

  var curMinK = 6;
  var curMaxK = 14;

  var maxScore = Number.NEGATIVE_INFINITY;

  var badScore = 0;

  for (var curK = curMinK; curK <= curMaxK; curK+=2) {
    var curKMeans = ML.KMeans(clusterData, curK, {seed: 0});
    var curInertia = inertia(geoClusterData, curKMeans);
    for (var curAttempt = 1; curAttempt < 12; curAttempt++) {
      var tmpKMeans = ML.KMeans(clusterData, curK, {seed: curAttempt});
      var tmpInertia = inertia(geoClusterData, tmpKMeans);

      if ( tmpInertia > curInertia ) { continue; }

      curInertia = tmpInertia;
      curKMeans = tmpKMeans;
    }

    curScore = Math.pow(curK, 1) * silhouette(geoClusterData, curKMeans, curK);

    if ( curScore < maxScore ) { continue; }

    maxScore = curScore;

    curCentroids = curScaler.inverseTransform(customTranspose(
      curKMeans.centroids.map(
        function (curCentroid) { return curCentroid.centroid }
      )
    )).to2DArray();
  }

  var curLatLon = [curCentroid[0], curCentroid[1]];

  curCentroids = pca.invert(
    curCentroids.map(function (curCentroid) { return [curCentroid[0], curCentroid[1]] })
  ).addColumn(
    curCentroids.map(function (curCentroid) { return curCentroid[2] })
  ).to2DArray();

  cityHotSpots[usedCity] = curCentroids;
}

$(document).on("loadedAirbnbData", runClustering);
