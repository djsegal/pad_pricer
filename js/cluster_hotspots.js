function clusterHotspots(usedCity, XInput, targetColumn) {
  var colNames = Object.keys(XInput);

  kmeans_columns = ["latitude", "longitude"];

  clusterData = pickCols(
    XInput, kmeans_columns, colNames
  );

  const pca = new ML.PCA(customTranspose(clusterData), {scale: true});

  clusterData = pca.predict(
    customTranspose(clusterData)
  ).transpose().to2DArray();

  clusterData.push(targetColumn);

  curScaler = StandardScaler();
  clusterData = curScaler.fitTransform(clusterData).to2DArray()

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

  curCentroids = pca.invert(
    curCentroids.map(function (curCentroid) { return [curCentroid[0], curCentroid[1]] })
  ).addColumn(
    curCentroids.map(function (curCentroid) { return curCentroid[2] })
  ).to2DArray();

  return curCentroids;
}
