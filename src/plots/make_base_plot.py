import numpy as np
import geopandas

import matplotlib.pyplot as plt

from shapely.ops import unary_union
from shapely.geometry import JOIN_STYLE

world = geopandas.read_file(geopandas.datasets.get_path('naturalearth_lowres'))

world = world[
    ( world["name"] == "Germany" ) | ( world["name"] == "France" ) |
    ( world["name"] == "United States of America" )
]

def make_base_plot(cur_city_data, is_fast=True):
    cur_city_geo = cur_city_data.geo

    if not is_fast:
        eps = 1e-5
        work_geo = cur_city_geo.geometry.buffer(
            eps, 1, join_style=JOIN_STYLE.mitre
        ).buffer(
            -eps, 1, join_style=JOIN_STYLE.mitre
        )

        world.envelope.difference(
            unary_union(work_geo)
        ).plot(ax=plt.gca(), alpha=0.1375, color="lightblue", zorder=-2)

    if cur_city_data.Index == "new-york-city":
        cur_city_geo[cur_city_geo.neighbourhood_group == "New Jersey"].plot(
            ax=plt.gca(), alpha=0.08, color="lightgrey", edgecolor="black", linewidth=2, zorder=-1
        )

        cur_city_geo[cur_city_geo.neighbourhood_group != "New Jersey"].plot(
            ax=plt.gca(), alpha=0.25, color="lightgrey", edgecolor="black", linewidth=2, zorder=-1
        )
    else:
        cur_city_geo.plot(
            ax=plt.gca(), alpha=0.25, color="lightgrey", edgecolor="black", linewidth=2, zorder=-1
        )

    cur_width = (
        cur_city_data.latitude_bounds[1] - cur_city_data.latitude_bounds[0]
    ) * cur_city_data.city_ratios

    if cur_width > np.diff(cur_city_data.latitude_bounds)[0]:
        used_latitude_bounds = cur_city_data.latitude_bounds
        used_longitude_bounds = (
            cur_city_data.city_centers[1] - 4/3 * cur_width / 2,
            cur_city_data.city_centers[1] + 4/3 * cur_width / 2
        )
    else:
        cur_width = (
            cur_city_data.longitude_bounds[1] - cur_city_data.longitude_bounds[0]
        ) / cur_city_data.city_ratios

        used_longitude_bounds = cur_city_data.longitude_bounds
        used_latitude_bounds = (
            cur_city_data.city_centers[0] - 3/4 * cur_width / 2,
            cur_city_data.city_centers[0] + 3/4 * cur_width / 2
        )

    plt.xlim(*used_longitude_bounds)
    plt.ylim(*used_latitude_bounds)

    plt.grid(False)
    plt.xticks([])
    plt.yticks([])

    plt.title(cur_city_data.name)

    cur_city_geo.plot(ax=plt.gca(), alpha=0.8, facecolor="none", edgecolor="white", linewidth=1, zorder=1)

    plt.gca().set_aspect(cur_city_data.city_ratios)
