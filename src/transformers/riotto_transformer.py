import numpy as np

from sklearn.base import BaseEstimator, TransformerMixin

from sklearn.preprocessing import PowerTransformer
from sklearn.preprocessing import Binarizer

class RiottoTransformer(BaseEstimator, TransformerMixin):

    def __init__(self, threshold=0.5, transform_func=None):
        self.input_features = None
        self.transform_func = transform_func
        self.threshold = threshold

    def fit(self, X, y=None):
        assert np.all( X >= 0 )

        assert self.input_features is None
        self.input_features = []

        if self.transform_func is None:
            min_values = []

            for j in range(X.shape[-1]):
                work_col = X.iloc[:,j]
                min_value = np.min(work_col[work_col > 0])
                min_values.append(min_value)

            self.transform_func = \
                lambda work_data: np.log(work_data + min_values)

        self.binarizer = \
            Binarizer(threshold=self.threshold).fit(X)

        self.normalizer = \
            PowerTransformer().fit(self.transform_func(X))

        if type(X) == np.ndarray: return self
        init_columns = X.columns.tolist()

        for cur_type in ["binarized", "normalized"]:
            self.input_features.extend(list(
                map(lambda tmp_column: f"{tmp_column}_{cur_type}", init_columns)
            ))

        return self

    def transform(self, X):
        assert self.input_features is not None

        X_list = [
            self.binarizer.transform(X),
            self.normalizer.transform(
                self.transform_func(X)
            )
        ]

        return np.concatenate(X_list, axis=1)

    def get_feature_names(self, input_features=None):
        assert self.input_features != None
        return self.input_features
