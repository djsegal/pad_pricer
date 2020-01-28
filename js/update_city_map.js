function updateCityMap() {

  var verDist = cityBounds[selectedCity].maxLat - cityBounds[selectedCity].minLat;
  var horDist = cityBounds[selectedCity].maxLon - cityBounds[selectedCity].minLon;

  verDist /= 5;
  horDist /= 5;

  map.setRestriction({
    latLngBounds: {
      east: cityBounds[selectedCity].maxLon+horDist,
      north: cityBounds[selectedCity].maxLat+verDist,
      south: cityBounds[selectedCity].minLat-verDist,
      west: cityBounds[selectedCity].minLon-horDist
    }
  })

  autocompleteBounds = {
    east: cityBounds[selectedCity].maxLon,
    north: cityBounds[selectedCity].maxLat,
    south: cityBounds[selectedCity].minLat,
    west: cityBounds[selectedCity].minLon
  }

  autocompleteTop.setBounds(autocompleteBounds);
  autocompleteBot.setBounds(autocompleteBounds);

  map.setCenter({
    lat: cityBounds[selectedCity].centerLat,
    lng: cityBounds[selectedCity].centerLon
  })

  marker.setPosition({
    lat: cityMarkers[selectedCity][0],
    lng: cityMarkers[selectedCity][1]
  })

  $(document).trigger("updatePrice");

}

$(document).on("updateCityMap", updateCityMap);
