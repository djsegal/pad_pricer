import numpy as np

from sklearn.base import BaseEstimator, TransformerMixin

class DummyExpandTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, needed_columns):
        self.needed_columns = needed_columns
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

        if X.shape[1] >= self.needed_columns : return X

        X_1 = X.copy()
        X_2 = np.ones((X.shape[0], self.needed_columns - X.shape[1]))

        X = np.concatenate([X_1, X_2], axis=1)

        return X

    def get_feature_names(self, input_features=None):
        assert type(self.input_features) == list
        if input_features is not None:
            assert self.input_features == list(input_features)

        return self.input_features
