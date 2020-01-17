  function pickCols(curData, pickedCols, colNames) {
    pickedColIndices = pickedCols.map(function (pickedCol) {
      return colNames.indexOf(pickedCol);
    });

    if ( typeof curData.getColumn === 'function' ) {
      pickedColVecs = pickedColIndices.map(function (pickedIndex) {
        return curData.getColumn(pickedIndex);
      });

      prunedData = new ML.Matrix(pickedColVecs).transpose();
    } else if ( typeof curData.get === 'function' ) {
      prunedData = get(curData, [], pickedColIndices);
    } else {
      prunedData = new ML.Matrix(_XClean(curData))
      prunedData = pickCols(prunedData, pickedCols, colNames);
      prunedData = prunedData.transpose().to2DArray();
    }

    return prunedData;
  }
