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

  autocomplete.setBounds({
    east: cityBounds[selectedCity].maxLon+horDist,
    north: cityBounds[selectedCity].maxLat+verDist,
    south: cityBounds[selectedCity].minLat-verDist,
    west: cityBounds[selectedCity].minLon-horDist
  })

  map.setCenter({
    lat: cityBounds[selectedCity].centerLat,
    lng: cityBounds[selectedCity].centerLon
  })

  marker.setPosition({
    lat: cityBounds[selectedCity].centerLat,
    lng: cityBounds[selectedCity].centerLon
  })

  $("#js-autocomplete").val("")

  $(document).trigger("updatePrice");

}

$(document).on("updateCityMap", updateCityMap);
