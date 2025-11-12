
from __future__ import annotations
import os
from typing import Literal
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration for real-time monitoring and anomaly detection."""

    # Sampling interval in seconds
    SAMPLE_INTERVAL: float = float(os.getenv("SAMPLE_INTERVAL", "1.0"))

    # Anomaly detection parameters
    WINDOW: int = int(os.getenv("WINDOW", "5"))  # sliding window size for detection
    BASELINE: int = int(os.getenv("BASELINE", "60"))  # baseline buffer size
    THRESHOLD_PCT: float = float(os.getenv("THRESHOLD_PCT", "98.0"))  # percentile threshold
    SUSTAIN: int = int(os.getenv("SUSTAIN", "6"))  # sustained alarm count
    ENSEMBLE: Literal["max", "mean"] = os.getenv("ENSEMBLE", "max")  # type: ignore

    # Feature flags
    INCLUDE_SCORES: bool = os.getenv("INCLUDE_SCORES", "true").lower() == "true"

    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

config = Config()
