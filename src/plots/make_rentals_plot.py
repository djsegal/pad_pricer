import numpy as np
import geopandas

import matplotlib.pyplot as plt

from plots.make_base_plot import make_base_plot

def make_rentals_plot(cur_city_data, is_fast=True):
    cur_rentals = cur_city_data.rentals.sort_values(by="price")

    cur_rentals= geopandas.GeoDataFrame(
        cur_rentals, geometry=geopandas.points_from_xy(
            cur_rentals.longitude, cur_rentals.latitude
        )
    )

    cur_marker_size = np.sqrt(cur_rentals.weight)*np.sqrt(cur_rentals.price)
    cur_marker_size /= np.max(cur_marker_size)
    cur_marker_size *= 50

    cur_rentals.plot(
        ax=plt.gca(), c=cur_rentals.price ** 4/5,
        alpha=4.5/(np.log10(len(cur_rentals))**2),
        markersize=cur_marker_size, zorder=0
    )

    make_base_plot(cur_city_data, is_fast)
