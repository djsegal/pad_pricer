import numpy as np
import pandas as pd

from sklearn.base import clone
from sklearn.pipeline import Pipeline

from sklearn.preprocessing import StandardScaler
from sklearn.covariance import EllipticEnvelope
from sklearn.mixture import BayesianGaussianMixture

def make_clusters(cur_data, cur_target, cur_n_components=32):
    assert "weight" in cur_data.columns
    cur_data = cur_data.copy()

    cloned_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('outliers', EllipticEnvelope(random_state=42))
    ])

    print(len(cur_data))

    cur_data = cur_data[
        clone(cloned_pipeline).fit_predict(
            cur_data.drop(columns="weight")
        ) == 1
    ]

    print(len(cur_data))

    price_cuts = 5 * ( 1 + pd.qcut(cur_data[cur_target], 20, labels=False) )
    cur_weights = price_cuts.map(
        lambda tmp_weight: 3 if tmp_weight > 90 else (
            2 if tmp_weight > 75 else (
                1 if tmp_weight > 45 else 0
            )
        )
    )

    weight_count = 4
    weight_cuts = pd.qcut(
        cur_data["weight"], weight_count, labels=False
    )
    cur_weights += ( np.array(weight_cuts.values) == ( weight_count - 1 )  )

    clustered_indices = []
    for cur_index, cur_value in cur_weights.iteritems():
        clustered_indices.extend([cur_index] * cur_value)
    cur_data = cur_data.loc[clustered_indices].sample(frac=1.0, random_state=42)

    cur_data = cur_data[
        clone(cloned_pipeline).fit_predict(
            cur_data.drop(columns="weight")
        ) == 1
    ]

    cur_data = cur_data[["longitude","latitude"]]

    print(len(cur_data))

    cur_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('bgm', BayesianGaussianMixture(
            n_components = cur_n_components, n_init = 8,
            max_iter=750, random_state=42
        ))
    ])

    cur_pipeline.fit(cur_data)

    return cur_pipeline
