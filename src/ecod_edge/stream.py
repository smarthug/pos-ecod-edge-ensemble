
from __future__ import annotations
import time, csv
from typing import Iterator, List, Tuple
import numpy as np

def iter_csv_rows(path: str, interval: float = 0.0) -> Iterator[Tuple[str, List[float]]]:
    """Yield (timestamp, features[]) row by row. Assumes first column is ts, rest numeric."""
    with open(path, newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            ts = row[0]
            feats = [float(x) for x in row[1:]]
            yield ts, feats
            if interval > 0:
                time.sleep(interval)

def windowed_vectors(rows: Iterator[Tuple[str, List[float]]], window: int):
    buf_ts, buf = [], []
    for ts, feats in rows:
        buf.append(feats)
        buf_ts.append(ts)
        if len(buf) >= window:
            X = np.array(buf[-window:])
            yield buf_ts[-1], X  # last timestamp of window, X shape: (window, dim)
