const cityList = ["san-francisco"]; // ["new-york-city", "san-francisco", "paris", "berlin"];

cityData = {}

cityList.forEach(function (cityName) {
  cityData[cityName] = {};

  ["X", "y"].forEach(function (curVar) {
    ["train", "test"].forEach(function (splitName) {
      curUrl = "https://djsegal.github.io/pad_pricer/data/splits/"
      curUrl += cityName.replace(/\-/g, "_") + "_"
      curUrl += curVar + "_"
      curUrl += splitName + ".json";

      $.getJSON(
        curUrl, function(curData) {
          keyName = curVar + "_" + splitName;
          cityData[cityName][keyName] = curData;
          customSyncLoad();
        }
      );
    })
  });
});

function customSyncLoad() {
  var isLoaded = true;

  cityList.forEach(function (cityName) {
    if (!(cityName in cityData)) { isLoaded = false; };

    ["X", "y"].forEach(function (curVar) {
      ["train", "test"].forEach(function (splitName) {
        keyName = curVar + "_" + splitName;
        if (!(keyName in cityData[cityName])) { isLoaded = false; };
      })
    })
  });

  if (!isLoaded) { return; }

  $(document).trigger("loadedAirbnbData");

}