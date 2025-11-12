
from __future__ import annotations
import time, sys, statistics
from typing import Iterable, List, Deque
from collections import deque

class PercentileThreshold:
    """Maintain a rolling buffer of scores and provide percentile-based thresholding."""
    def __init__(self, maxlen: int = 600):
        self.buf: Deque[float] = deque(maxlen=maxlen)

    def update(self, value: float) -> None:
        self.buf.append(value)

    def percentile(self, pct: float) -> float:
        if not self.buf:
            return float("inf")
        arr = sorted(self.buf)
        k = max(0, min(len(arr)-1, int(round((pct/100.0)* (len(arr)-1)))))
        return arr[k]

class SustainAlarm:
    """Trigger alarm if k out of last n frames exceed threshold."""
    def __init__(self, n: int = 10, k: int = 6):
        self.n = n
        self.k = k
        self.history: Deque[bool] = deque(maxlen=n)

    def update(self, exceed: bool) -> bool:
        self.history.append(exceed)
        return sum(self.history) >= self.k
