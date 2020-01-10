import matplotlib.pyplot as plt

from plots.make_base_plot import make_base_plot
from plots.plot_gaussian_mixture import plot_gaussian_mixture

def make_clusters_plot(cur_city_data, is_fast=True):
    cur_city_data.metro.drop_duplicates(subset="geometry").plot(
        ax=plt.gca(), color="orange", alpha=2/3, linewidth=1/2, zorder=2
    )

    plot_gaussian_mixture(
        cur_city_data.bgm_pipeline,
        cur_city_data.X_train[["longitude", "latitude"]]
    )

    make_base_plot(cur_city_data, is_fast)
