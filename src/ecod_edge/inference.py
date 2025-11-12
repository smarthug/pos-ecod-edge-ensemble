
from __future__ import annotations
import numpy as np
from collections import deque
from typing import Deque, Optional
from dataclasses import dataclass

from ecod_edge.detectors import ECODDetector, IForestDetector
from ecod_edge.utils import PercentileThreshold, SustainAlarm
from ecod_edge.metrics import MetricSnapshot

@dataclass
class DetectionResult:
    """Anomaly detection results for a single sample."""
    score_ecod: float
    score_iforest: float
    score_ens: float
    threshold: float
    exceed: bool
    alarm: bool

class RealtimeDetector:
    """Real-time anomaly detection with sliding window and ensemble scoring."""

    def __init__(
        self,
        window: int = 5,
        baseline: int = 60,
        threshold_pct: float = 98.0,
        sustain: int = 6,
        ensemble: str = "max",
    ):
        """
        Args:
            window: Sliding window size for detection
            baseline: Buffer size for threshold calculation
            threshold_pct: Percentile for threshold (e.g., 98.0 = 98th percentile)
            sustain: Number of exceeds in last n frames to trigger alarm
            ensemble: Ensemble method - "max" or "mean"
        """
        self.window = window
        self.baseline = baseline
        self.threshold_pct = threshold_pct
        self.sustain = sustain
        self.ensemble = ensemble

        # Detectors
        self.ecod = ECODDetector()
        self.iforest = IForestDetector()

        # Sliding window buffer
        self.buffer: Deque[np.ndarray] = deque(maxlen=window)

        # Threshold and alarm tracking
        self.threshold_tracker = PercentileThreshold(maxlen=baseline)
        self.alarm_tracker = SustainAlarm(n=sustain, k=sustain)

        self._fitted = False

    def _metric_to_vector(self, metric: MetricSnapshot) -> np.ndarray:
        """Convert MetricSnapshot to feature vector."""
        return np.array([
            metric.cpu,
            metric.mem,
            metric.netInBps,
            metric.netOutBps,
            metric.diskReadBps,
            metric.diskWriteBps,
        ], dtype=np.float64)

    def process(self, metric: MetricSnapshot) -> Optional[DetectionResult]:
        """
        Process a new metric sample and return detection results.

        Returns None if not enough samples yet for detection.
        """
        vec = self._metric_to_vector(metric)
        self.buffer.append(vec)

        # Need at least window samples to start detection
        if len(self.buffer) < self.window:
            return None

        # Build window matrix (window x features)
        X = np.array(list(self.buffer))

        # Fit both models on current window
        self.ecod.fit(X)
        self.iforest.fit(X)
        self._fitted = True

        # Score the latest sample
        latest = vec.reshape(1, -1)
        score_ecod = float(self.ecod.score(latest)[0])
        score_iforest = float(self.iforest.score(latest)[0])

        # Ensemble scoring
        if self.ensemble == "max":
            score_ens = max(score_ecod, score_iforest)
        else:  # mean
            score_ens = (score_ecod + score_iforest) / 2.0

        # Update threshold tracker
        self.threshold_tracker.update(score_ens)
        threshold = self.threshold_tracker.percentile(self.threshold_pct)

        # Check if exceeds threshold
        exceed = score_ens > threshold

        # Update alarm tracker
        alarm = self.alarm_tracker.update(exceed)

        return DetectionResult(
            score_ecod=score_ecod,
            score_iforest=score_iforest,
            score_ens=score_ens,
            threshold=threshold,
            exceed=exceed,
            alarm=alarm,
        )
