import numpy as np

def prepare_data_1(X, y):
    cur_X = X.copy()

    cur_X["accommodates_per_bedroom"] = cur_X["accommodates"] / cur_X["bedrooms"]
    cur_X["bedrooms_times_bathrooms"] = cur_X["bedrooms"] * cur_X["bathrooms"]

    del cur_X["bedrooms"]
    del cur_X["bathrooms"]

    cur_w = cur_X.weight
    cur_X = cur_X.drop(columns=["weight", "latitude", "longitude"])

    cur_y = np.log10(y)

    return cur_X, cur_y, cur_w
