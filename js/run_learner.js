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

    var jsonPCAs = {};

    Object.keys(curPCAs).forEach(function (curIndex) {
      jsonPCAs[curIndex] = curPCAs[curIndex].toJSON();
    });

    console.log("")
    console.log("curPCAs")
    console.log(JSON.stringify(jsonPCAs))
  } else {
    cityList.forEach(_runLearner);
  }

  console.log("learner ...done")

  $(document).trigger("learnedAirbnbData");
}

function _runLearner(usedCity) {
  console.log(usedCity)

  yPredictor = yClean(cityData[usedCity].y_predictor)
  yCorrector = yClean(cityData[usedCity].y_corrector)
  yTest = yClean(cityData[usedCity].y_test)

  XPredictor = prepareLearner(cityData[usedCity].X_predictor, usedCity)
  XCorrector = prepareLearner(cityData[usedCity].X_corrector, usedCity)
  XTest = prepareLearner(cityData[usedCity].X_test, usedCity)

  if ( typeof curLearners[usedCity] === "undefined" ) {
    if ( usedCity == 'paris' ) {
      var nEstimators = 8;
    } else if ( usedCity == 'new-york-city' ) {
      var nEstimators = 12;
    } else if ( usedCity == 'san-francisco') {
      var nEstimators = 24;
    } else if ( usedCity == 'berlin' ) {
      var nEstimators = 18;
    } else {
      console.log("bad city in _runLearner")
    }

    curLearner = new ML.RandomForestRegression({
      nEstimators: nEstimators,
      replacement: true,
      maxFeatures: 3,
      treeOptions: {
        maxDepth: 16,
        minNumSamples: Math.ceil( XPredictor.length / 160 )
      }
    })

    curLearner.train(XPredictor, yPredictor)
    initJSON = JSON.stringify(curLearner.toJSON())

    var bestLearner = undefined;
    var bestScore = Number.NEGATIVE_INFINITY;

    for (var i = 14; i > 3; i--) {
      newLearner = pruneLearnerTree(
        ML.RandomForestRegression.load(JSON.parse(initJSON)), i
      );

      newScore = R2(newLearner, XTest, yTest);
      if ( newScore <= bestScore ) { continue; }

      bestScore = newScore;
      bestLearner = newLearner;
    }

    console.log(bestLearner.treeOptions.maxDepth);
    curLearners[usedCity] = bestLearner;
  }

  console.log(R2(curLearners[usedCity], XPredictor, yPredictor));
  console.log(R2(curLearners[usedCity], XTest, yTest));
}

function pruneLearnerTree(tmpLearner, maxDepth) {
  var initDepth = tmpLearner.treeOptions.maxDepth;

  for (var i = initDepth; i >= maxDepth; i--) {
    tmpLearner = pruneLearnerTreeHelper(tmpLearner, i);
  }

  return tmpLearner;
}

function pruneLearnerTreeHelper(tmpLearner, maxDepth) {
  tmpLearner.treeOptions.maxDepth = maxDepth;

  tmpLearner.estimators.forEach(function (curEstimator) {
    curEstimator.options.maxDepth = maxDepth;

    pruneLearnerTreeRecursive(
      curEstimator.root, 0, maxDepth
    );
  })

  tmpLearner = ML.RandomForestRegression.load(tmpLearner.toJSON());

  return tmpLearner;
}

function pruneLearnerTreeRecursive(curNode, curDepth, maxDepth) {
  curNode.maxDepth = maxDepth;

  if ( curDepth == maxDepth ) {
    var curDistribution = 0;
    var curCount = 0

    if ( typeof curNode.left !== "undefined" ) {
      curDistribution += 1 / curNode.left.distribution;
      curCount += 1;
    }

    if ( typeof curNode.left !== "undefined" ) {
      curDistribution += 1 / curNode.right.distribution;
      curCount += 1;
    }

    if ( curCount == 0 ) { return; }

    curDistribution = curCount / curDistribution;
    curNode.distribution = curDistribution;

    return;
  }

  if ( curDepth > maxDepth ) { console.log("Recursive depth error in learner.") }

  if ( typeof curNode.left !== "undefined" ) {
    pruneLearnerTreeRecursive(curNode.left, curDepth+1, maxDepth);
  }

  if ( typeof curNode.right !== "undefined" ) {
    pruneLearnerTreeRecursive(curNode.right, curDepth+1, maxDepth);
  }
}

$(document).on("clusteredAirbnbData", runLearner);
