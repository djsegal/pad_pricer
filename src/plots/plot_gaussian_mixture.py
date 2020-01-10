from matplotlib.colors import LogNorm

import matplotlib.pyplot as plt
import numpy as np

def plot_gaussian_mixture(clusterer, X, resolution=500, show_ylabels=True):
    X = X.to_numpy()

    mins = X.min(axis=0) - 0.1
    maxs = X.max(axis=0) + 0.1

    xx, yy = np.meshgrid(
        np.linspace(mins[0], maxs[0], resolution),
        np.linspace(mins[1], maxs[1], resolution)
    )

    Z = -clusterer.score_samples(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    plt.contour(xx, yy, Z,
        norm=LogNorm(),
        levels=np.logspace(np.log10(np.min(Z)),np.log10(np.max(Z)), 9),
        cmap="viridis_r",
        linewidths=2
   )

    clusterer_means = clusterer.steps[0][-1].inverse_transform(clusterer.steps[-1][-1].means_)
    clusterer_weights = clusterer.steps[-1][-1].weights_

    clusterer_means = clusterer_means[clusterer_weights > 3e-3]
    clusterer_weights = clusterer_weights[clusterer_weights > 3e-3]

    centroids = clusterer_means[clusterer_weights > clusterer_weights.max() / 10]
    plt.scatter(clusterer_means[:, 0], clusterer_means[:, 1],
        s=30, color='k', alpha=0.5
    )
