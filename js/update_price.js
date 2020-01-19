function updatePrice() {

  var cantPrice = (
    Object.keys(curScalers).length == 0 ||
    Object.keys(curRegressors).length == 0
  );

  if ( cantPrice ) { return; }

  var curInput = RegressorColumns.map(function (regressorCol) {
    return featureDict[regressorCol];
  });

  curInput.push(
    curLearners[selectedCity].predict(prepareLearner(marker.getPosition(), selectedCity))[0]
  )

  cur_input = curScalers[selectedCity].transform(
    customTranspose([curInput])
  );

  var curPrice = curRegressors[selectedCity].predict(cur_input.to2DArray());

  curPrice = Math.pow(10, curPrice);

  $(".js-price span").text(curCurrency + Math.round(curPrice));
}

$(document).on("updatePrice", updatePrice);
