function updatePrice() {

  var cantPrice = (
    Object.keys(curScalers).length == 0 ||
    Object.keys(curRegressors).length == 0 ||
    Object.keys(curPCAs).length == 0 ||
    Object.keys(curLearners).length == 0
  );

  if ( cantPrice ) { return; }

  var curInput = RegressorColumns.map(function (regressorCol) {
    return [featureDict[regressorCol]];
  });

  markerPosition = marker.getPosition();

  if ( typeof markerPosition === "undefined" ) { return; }

  cityMarkers[selectedCity] = [markerPosition.lat(), markerPosition.lng()]

  curInput = prepareRegression(curInput, markerPosition, selectedCity, true)

  curInput = curScalers[selectedCity].transform(
    customTranspose([curInput])
  );

  usedIndices = curFeatureIndices[selectedCity];

  curInput = new ML.Matrix([
    usedIndices.map(i => curInput.to1DArray()[i])
  ]).to2DArray()

  var curPrice = curRegressors[selectedCity].predict(curInput);

  curPrice = Math.pow(10, curPrice);

  $(".js-price span").text(curCurrency + Math.round(curPrice));

  curLink = "https://www.airbnb.com/s/"
  curLink += selectedCity + "/homes";
  curLink += "?property_type_id%5B%5D=1";
  curLink += "&room_types%5B%5D=Entire%20home%2Fapt";

  curLink += "&adults=" + featureDict["accommodates"];
  curLink += "&min_bedrooms=" + featureDict["bedrooms"];
  curLink += "&min_bathrooms=" + featureDict["bathrooms"];

  mile_per_lat = 0.621371 * 111.32;
  mile_per_lng = 0.621371 * (40075/360) * cos(markerPosition.lat() * (2*Math.PI/360));

  box_radius = 0.125 // miles

  curLink += "&ne_lat=" + ( markerPosition.lat() + box_radius / mile_per_lat );
  curLink += "&ne_lng=" + ( markerPosition.lng() + box_radius / mile_per_lng );
  curLink += "&sw_lat=" + ( markerPosition.lat() - box_radius / mile_per_lat );
  curLink += "&sw_lng=" + ( markerPosition.lng() - box_radius / mile_per_lng );

  $(".js-price a").attr("href", curLink);

}

$(document).on("updatePrice", updatePrice);
