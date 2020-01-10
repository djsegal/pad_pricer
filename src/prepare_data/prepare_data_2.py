import numpy as np
import pandas as pd

from prepare_data.prepare_data_1 import prepare_data_1

def prepare_data_2(X, y, cur_bgm_pipeline):
    cur_X_1, cur_y, cur_w = prepare_data_1(X, y)

    col_selector = cur_bgm_pipeline[-1].weights_ > 3e-3

    cur_X_2 = cur_bgm_pipeline.predict_proba(
        X[["longitude", "latitude"]]
    )[:,cur_bgm_pipeline[-1].weights_ > 3e-3]

    sub_weights = cur_bgm_pipeline[-1].weights_[col_selector]

    cur_X_2 = pd.DataFrame(
        cur_X_2[:,list(reversed(np.argsort(sub_weights)))],
        index=X.index
    )

    cur_X_2.columns = map(
        lambda cur_index: f"_cluster_a_{cur_index}",
        range(len(cur_X_2.columns))
    )

    cur_X = pd.merge(
        cur_X_1, cur_X_2, left_index=True, right_index=True
    )

    return cur_X, cur_y, cur_w
