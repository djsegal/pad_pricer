from sklearn.base import clone
from sklearn.pipeline import Pipeline
from mlxtend.regressor import StackingCVRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectFromModel

from sklearn.svm import SVR

from sklearn.linear_model import RidgeCV
from sklearn.linear_model import LassoCV

from sklearn.linear_model import HuberRegressor
from sklearn.linear_model import BayesianRidge

from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.ensemble import AdaBoostRegressor

def regression_pipeline(is_full=True):
  if is_full:
      cur_regressor_list = [
          SVR(kernel="rbf"),
          SVR(kernel="linear"),
          HuberRegressor(),
          BayesianRidge()
      ]
  else:
      cur_regressor_list = []

  cur_regressor_list.extend([
      RidgeCV(),
      RandomForestRegressor(random_state=42)
  ])

  if is_full:
      cur_regressor_list.extend([
          ExtraTreesRegressor(random_state=42),
          AdaBoostRegressor(random_state=42)
      ])

  cur_regressor = StackingCVRegressor(
      cur_regressor_list, RidgeCV(),
      random_state=42, n_jobs=-1
  )

  cloned_selector = SelectFromModel(LassoCV(random_state=42, n_jobs=-1))

  cur_pipeline = Pipeline([
      ('scaler', StandardScaler()),
      ('selector_1', clone(cloned_selector)),
      ('selector_2', clone(cloned_selector)),
      ('selector_3', clone(cloned_selector)),
      ('regressor', clone(cur_regressor))
  ])

  return cur_pipeline
