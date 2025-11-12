
from __future__ import annotations
import csv, sys, yaml
from typing import Dict, List
import numpy as np
from rich.console import Console
from rich.table import Table

from .utils import PercentileThreshold, SustainAlarm
from .detectors import ECODDetector, IForestDetector
from .stream import iter_csv_rows, windowed_vectors

console = Console()

def run_pipeline(
    mock_path: str,
    interval: float = 0.0,
    window: int = 5,
    baseline: int = 60,
    threshold_pct: float = 98.0,
    sustain: int = 6,
    ensemble: str = "max",
    features: List[str] = None,
    out_csv: str = None
):
    # Initialize
    ecod = ECODDetector()
    iforest = IForestDetector()

    # Warm-up baseline buffers
    score_hist = PercentileThreshold(maxlen=baseline*2)  # keep extra
    alarm = SustainAlarm(n=10, k=sustain)

    # For output
    writer = None
    if out_csv:
        wf = open(out_csv, "w", newline="")
        writer = csv.writer(wf)
        writer.writerow(["ts","score_ecod","score_iforest","score_ens","threshold","exceed","alarm"])

    # Iterate stream
    rows = iter_csv_rows(mock_path, interval=interval)
    for i, (ts, Xw) in enumerate(windowed_vectors(rows, window=window), start=1):
        # Fit models incrementally: ECOD/IForest are batch; here we refit on sliding window
        ecod.fit(Xw)
        s_ecod = float(ecod.score(Xw[-1:].reshape(1, -1))[0])

        iforest.fit(Xw)
        s_if = float(iforest.score(Xw[-1:].reshape(1, -1))[0])

        if ensemble == "mean":
            s_ens = 0.5*(s_ecod + s_if)
        else:
            s_ens = max(s_ecod, s_if)

        # Update threshold from history (uses past s_ens)
        score_hist.update(s_ens)
        thr = score_hist.percentile(threshold_pct)
        exceed = s_ens >= thr
        is_alarm = alarm.update(exceed)

        # Print row
        console.print(f"[bold]{ts}[/]  ECOD={s_ecod:.3f}  IF={s_if:.3f}  ENS={s_ens:.3f}  thr({threshold_pct:.0f}%)={thr:.3f}  exceed={exceed}  alarm={is_alarm}")
        if writer:
            writer.writerow([ts, f"{s_ecod:.6f}", f"{s_if:.6f}", f"{s_ens:.6f}", f"{thr:.6f}", int(exceed), int(is_alarm)])
            wf.flush()

    if writer:
        wf.close()
        console.print(f"[green]Saved alerts to {out_csv}[/]")

def load_config(path: str) -> Dict:
    with open(path) as f:
        return yaml.safe_load(f) or {}
