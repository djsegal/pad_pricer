function runLearner() {
  console.log("learner ...started")

  var missingJson = (
    Object.keys(curLearners).length == 0
  );

  if ( missingJson ) {
    cityList.forEach(_runLearner);
    var jsonLearners = {};

    Object.keys(curLearners).forEach(function (curIndex) {
      jsonLearners[curIndex] = curLearners[curIndex].toJSON();
    });

    console.log("")
    console.log("curLearners")
    console.log(JSON.stringify(jsonLearners))
  } else {
    cityList.forEach(_runLearner);
  }

  console.log("learner ...done")

  $(document).trigger("learnedAirbnbData");
}

function _runLearner(usedCity) {
  console.log(usedCity)

  yPredictor = yClean(cityData[usedCity].y_predictor)
  yTest = yClean(cityData[usedCity].y_test)

  XPredictor = prepareLearner(cityData[usedCity].X_predictor, usedCity)
  XTest = prepareLearner(cityData[usedCity].X_test, usedCity)

  if ( typeof curLearners[usedCity] === "undefined" ) {
    if ( usedCity == 'paris' ) {
      var nEstimators = 7;
    } else {
      var nEstimators = 11;
    }

    curLearner = new ML.RandomForestRegression({
      nEstimators: nEstimators,
      useSampleBagging: true,
      replacement: true,
      maxFeatures: 3,
      treeOptions: {
        maxDepth: 7,
        minNumSamples: 11
      }
    })

    curLearner.train(XPredictor, yPredictor)

    curLearners[usedCity] = curLearner;
  } else {
    curLearner = curLearners[usedCity];
  }

  console.log(R2(curLearner, XPredictor, yPredictor));
  console.log(R2(curLearner, XTest, yTest));
}

$(document).on("clusteredAirbnbData", runLearner);
