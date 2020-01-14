import numpy as np
import geopandas

import matplotlib.pyplot as plt

from plots.make_base_plot import make_base_plot

def make_rentals_plot(cur_city_data, cur_rentals=None, cur_target="price", marker_scalar=1, clims=None, is_fast=True):
    if cur_rentals is None:
        cur_rentals = cur_city_data.rentals

    cur_rentals = cur_rentals.sort_values(by=cur_target)

    cur_rentals= geopandas.GeoDataFrame(
        cur_rentals, geometry=geopandas.points_from_xy(
            cur_rentals.longitude, cur_rentals.latitude
        )
    )

    cur_marker_size = np.sqrt(cur_rentals.weight)*np.sqrt(cur_rentals[cur_target])
    cur_marker_size /= np.max(cur_marker_size)
    cur_marker_size *= 50 * marker_scalar

    cur_colors = cur_rentals[cur_target] ** 4/5

    if clims == None:
        clims = [
            np.min(cur_colors), np.max(cur_colors)
        ]

    cur_rentals.plot(
        ax=plt.gca(), c=cur_colors,
        alpha=4.5/(np.log10(len(cur_rentals))**2),
        markersize=cur_marker_size, zorder=0,
        vmin=clims[0], vmax=clims[-1]
    )

    make_base_plot(cur_city_data, is_fast)
