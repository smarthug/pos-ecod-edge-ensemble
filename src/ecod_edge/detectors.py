
from __future__ import annotations
import numpy as np
from typing import Optional
from pyod.models.ecod import ECOD
from sklearn.ensemble import IsolationForest

class ECODDetector:
    def __init__(self):
        self.model = ECOD()

    def fit(self, X: np.ndarray):
        self.model.fit(X)
        return self

    def score(self, X: np.ndarray) -> np.ndarray:
        # higher is more anomalous
        return self.model.decision_function(X)

class IForestDetector:
    def __init__(self, n_estimators: int = 200, contamination: float = 0.02, random_state: int = 42):
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state,
            n_jobs=-1
        )
        self._fitted = False

    def fit(self, X: np.ndarray):
        self.model.fit(X)
        self._fitted = True
        return self

    def score(self, X: np.ndarray) -> np.ndarray:
        # sklearn IF returns anomaly score = -score_samples (higher -> more abnormal)
        return -self.model.score_samples(X)
