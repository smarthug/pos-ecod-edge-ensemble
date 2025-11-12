
from __future__ import annotations
import argparse, os
from .pipeline import run_pipeline, load_config

def main():
    p = argparse.ArgumentParser(description="ECOD real-time + IForest complement pipeline")
    p.add_argument("--mock", type=str, required=True, help="CSV path to simulate stream")
    p.add_argument("--interval", type=float, default=None, help="Seconds between records (0 for batch)")
    p.add_argument("--window", type=int, default=None, help="Sliding window size")
    p.add_argument("--baseline", type=int, default=None, help="Number of windows for baseline stats")
    p.add_argument("--threshold-pct", type=float, default=None, help="Percentile threshold")
    p.add_argument("--sustain", type=int, default=None, help="Alarm sustain k of last 10")
    p.add_argument("--ensemble", type=str, choices=["max","mean"], default=None, help="Ensemble rule")
    p.add_argument("--config", type=str, default=os.path.join(os.path.dirname(__file__), "config.yaml"), help="YAML config")
    p.add_argument("--out", type=str, default=None, help="Output alerts CSV")

    args = p.parse_args()
    cfg = load_config(args.config)

    def pick(name, default):
        v = getattr(args, name.replace("-","_"))
        if v is None:
            return cfg.get(name.replace("-","_"), default)
        return v

    run_pipeline(
        mock_path=args.mock,
        interval=pick("interval", 0.0),
        window=pick("window", 5),
        baseline=pick("baseline", 60),
        threshold_pct=pick("threshold-pct", 98.0),
        sustain=pick("sustain", 6),
        ensemble=pick("ensemble", "max"),
        features=cfg.get("features", None),
        out_csv=args.out
    )

if __name__ == "__main__":
    main()
