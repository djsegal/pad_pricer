import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split

def make_data_splits(cur_data):
    X_train_list, X_test_list = [], []
    y_train_list, y_test_list = [], []

    X_predictor_list, X_corrector_list = [], []
    y_predictor_list, y_corrector_list = [], []

    for cur_row in cur_data.itertuples():
        print(cur_row.name)
        work_data = cur_row.rentals.copy()

        cur_stratify = pd.merge(
            pd.qcut(np.log10(work_data["price"]), 12, labels=False),
            pd.qcut(work_data["weight"], 6, labels=False),
            left_index=True, right_index=True
        )

        X_train, X_test, y_train, y_test = train_test_split(
            work_data.drop(columns="price"), work_data["price"],
            stratify=cur_stratify, test_size=0.2, random_state=42
        )

        X_predictor, X_corrector, y_predictor, y_corrector = train_test_split(
            X_train, y_train, test_size=0.25, random_state=42,
            stratify=cur_stratify.loc[y_train.index]
        )

        X_train_list.append(X_train)
        X_test_list.append(X_test)
        y_train_list.append(y_train)
        y_test_list.append(y_test)

        X_predictor_list.append(X_predictor)
        X_corrector_list.append(X_corrector)
        y_predictor_list.append(y_predictor)
        y_corrector_list.append(y_corrector)

    cur_data["X_train"] = X_train_list
    cur_data["X_test"] = X_test_list
    cur_data["y_train"] = y_train_list
    cur_data["y_test"] = y_test_list

    cur_data["X_predictor"] = X_predictor_list
    cur_data["X_corrector"] = X_corrector_list
    cur_data["y_predictor"] = y_predictor_list
    cur_data["y_corrector"] = y_corrector_list
