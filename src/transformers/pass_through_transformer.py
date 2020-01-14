import numpy as np

from sklearn.base import BaseEstimator, TransformerMixin

class PassThroughTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.input_features = None

    def fit(self, X, y=None):
        assert self.input_features is None

        if type(X) == np.ndarray :
            self.input_features = []
        else:
            self.input_features = X.columns.tolist()

        return self

    def transform(self, X):
        assert self.input_features is not None
        return X

    def get_feature_names(self, input_features=None):
        assert type(self.input_features) == list
        if input_features is not None:
            assert self.input_features == list(input_features)

        return self.input_features
