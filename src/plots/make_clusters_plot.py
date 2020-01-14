import numpy as np
import matplotlib.pyplot as plt

from matplotlib.colors import LogNorm

from plots.make_base_plot import make_base_plot

def make_clusters_plot(cur_city_data, clusterer=None, is_fast=True):
    cur_city_data.metro.drop_duplicates(subset="geometry").plot(
        ax=plt.gca(), color="orange", alpha=2/3, linewidth=1/2, zorder=2
    )

    if clusterer == None:
        clusterer = cur_city_data.bgm_pipeline

    X = cur_city_data.rentals[["longitude", "latitude"]].to_numpy()

    mins = X.min(axis=0) - 0.1
    maxs = X.max(axis=0) + 0.1

    xx, yy = np.meshgrid(
        np.linspace(mins[0], maxs[0], 600),
        np.linspace(mins[1], maxs[1], 600)
    )

    Z = -clusterer.score_samples(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    plt.contour(xx, yy, Z,
        norm=LogNorm(),
        levels=np.logspace(np.log10(np.min(Z)),np.log10(np.max(Z)), 9),
        cmap="viridis_r",
        linewidths=2,
        zorder=3
   )

    clusterer_means = clusterer.steps[0][-1].inverse_transform(clusterer.steps[-1][-1].means_)
    clusterer_weights = clusterer.steps[-1][-1].weights_

    clusterer_means = clusterer_means[clusterer_weights >= np.max(clusterer_weights) / 100]

    plt.scatter(clusterer_means[:, 0], clusterer_means[:, 1],
        s=30, color='k', alpha=0.5, zorder=4
    )

    make_base_plot(cur_city_data, is_fast)
