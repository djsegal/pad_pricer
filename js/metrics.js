function R2(curRidge, XData, yData) {
  yAverage = average(yData);
  yPredict = curRidge.predict(XData);

  ssRes = 0.0
  ssTot = 0.0

  for (var i = 0; i < XData.length; i++) {
    ssRes += Math.pow( yData[i] - yPredict[i] , 2 )
    ssTot += Math.pow( yData[i] - yAverage , 2 )
  }

  curScore = 1 - ssRes / ssTot;

  return curScore;
}

function getRange(start, end) {
  return Array.from({
    length: 1 + Math.abs(end - start)
  }, (_, i) => end > start ? start + i : start - i);
}

function silhouette(clusterData, curKMeans, curK) {
  var a = Array(curK).fill(0);
  var b = Array(curK).fill(0);

  getRange(0, clusterData.length-1).forEach(function (i) {
    var thisError = 0;
    var thisCount = 0;

    var thoseErrors = Array(curK).fill(0);
    var thoseCounts = Array(curK).fill(0);

    for (var j = 0; j < clusterData.length; j++) {
      if ( i == j ) { continue; }

      var curVec = clusterData[i];
      var otherVec = clusterData[j];

      var workDist = 0.0;
      for (var k = 0; k < curVec.length; k++) {
        workDist += Math.pow(curVec[k] - otherVec[k], 2)
      }
      workDist = Math.sqrt(workDist);

      if ( curKMeans.clusters[i] == curKMeans.clusters[j] ) {
        thisError += workDist;
        thisCount += 1;
      } else {
        thoseErrors[curKMeans.clusters[j]] += workDist;
        thoseCounts[curKMeans.clusters[j]] += 1;
      }
    }

    a[i] = thisError / thisCount;

    minB = Number.POSITIVE_INFINITY;
    for (var tmpK = 0; tmpK < curK; tmpK++) {
      if ( tmpK == curKMeans.clusters[i] ) { continue; }
      tmpB = thoseErrors[tmpK] / thoseCounts[tmpK];

      if ( tmpB > minB ) { continue; }
      minB = tmpB;
    }

    b[i] = minB;
  });

  var s = Array(curK).fill(0);

  for (var i = 0; i < clusterData.length; i++) {
    s[i] = ( b[i] - a[i] ) / Math.max(a[i], b[i]);
  }

  return average(s);
}

function inertia(clusterData, curKMeans) {
  var curInertia = 0.0;

  for (var i = 0; i < clusterData.length; i++) {
    var curCentroid = curKMeans.centroids[curKMeans.clusters[i]].centroid;
    var curPoint = clusterData[i];

    for (var k = 0; k < curPoint.length; k++) {
      curInertia += Math.pow(curPoint[k] - curCentroid[k], 2)
    }
  }

  return curInertia
}
