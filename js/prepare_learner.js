function prepareLearner(XInput, usedCity) {

  if ( typeof XInput.longitude !== "undefined" ) {
    XData = [
      Object.values(XInput.longitude),
      Object.values(XInput.latitude)
    ]
  } else {
    XData = [
      [XInput.lng()],
      [XInput.lat()]
    ]
  }

  latitudePerLongitude = XData[1].map(function (curLat) {
    return (1.00675)*Math.cos(curLat * (2*Math.PI/360))
  })

  XData[0] = XData[0].map(function (curLon) { return curLon - cityBounds[usedCity].centerLon })
  XData[1] = XData[1].map(function (curLat) { return curLat - cityBounds[usedCity].centerLat })

  var curCount = XData[0].length;

  XData[0] = [...Array(curCount).keys()].map(function (curIndex) {
    return XData[0][curIndex] * latitudePerLongitude[curIndex]
  })

  if ( typeof curPCAs[usedCity] === "undefined" ) {
    curPCA = new ML.PCA(customTranspose(XData), {scale: true});

    curPCAs[usedCity] = curPCA;
  } else {
    curPCA = curPCAs[usedCity];
  }

  replacedXData = curPCA.predict(customTranspose(XData)).transpose().to2DArray();

  XData.push([...Array(curCount).keys()].map(function (curIndex) {
    return Math.sqrt(
      Math.pow(XData[0][curIndex], 2) + Math.pow(XData[1][curIndex], 2)
    )
  }))

  XData.push([...Array(curCount).keys()].map(function (curIndex) {
    return Math.atan2(
      XData[1][curIndex], XData[0][curIndex]
    )
  }))

  // XData.push(Object.values(XInput.accommodates))

  XData[0] = replacedXData[0]
  XData[1] = replacedXData[1]

  XData = customTranspose(XData)

  return XData;

}
