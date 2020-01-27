function prepareRegression(XData, XInput, usedCity, useErrors) {

  XData.push(
    curLearners[usedCity].predict(prepareLearner(XInput, usedCity))
  )

  var curCount = XData[0].length;

  var spotsList = [cityHotSpots];

  if ( useErrors ) { spotsList.push(cityErrorSpots); }

  var oneFootInMiles = 0.000189394;

  spotsList.forEach(function (citySpots) {
    citySpots[usedCity].forEach(function (curSpot) {
      var thisLatLng = [
        curSpot[0], curSpot[1]
      ]

      XData.push([...Array(curCount).keys()].map(function (curIndex) {
        if ( typeof XInput.latitude === "undefined" ) {
          var thatLatLng = [
            [XInput.lat()][curIndex],
            [XInput.lng()][curIndex],
          ]
        } else {
          var thatLatLng = [
            Object.values(XInput.latitude)[curIndex],
            Object.values(XInput.longitude)[curIndex],
          ]
        }

        return Math.log10(
          oneFootInMiles + haversineDistance(
            thisLatLng, thatLatLng
          )
        )
      }))
      //
    })
  });

  return XData

}
