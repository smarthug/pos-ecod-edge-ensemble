
from __future__ import annotations
import asyncio
import json
import logging
from typing import Set
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from ecod_edge.config import config
from ecod_edge.metrics import MetricsCollector, MetricSnapshot
from ecod_edge.inference import RealtimeDetector, DetectionResult

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Connection manager for multiple WebSocket clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Broadcast message to all connected clients."""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                disconnected.add(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    logger.info("Starting Real-time Monitoring Server")
    logger.info(f"Sample interval: {config.SAMPLE_INTERVAL}s")
    logger.info(f"Detection enabled: {config.INCLUDE_SCORES}")
    if config.INCLUDE_SCORES:
        logger.info(f"Window: {config.WINDOW}, Baseline: {config.BASELINE}, "
                   f"Threshold: {config.THRESHOLD_PCT}%, Sustain: {config.SUSTAIN}, "
                   f"Ensemble: {config.ENSEMBLE}")
    yield
    logger.info("Shutting down Real-time Monitoring Server")

# Create FastAPI app
app = FastAPI(
    title="Real-time System Monitoring API",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def healthcheck():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "active_connections": len(manager.active_connections),
        "config": {
            "sample_interval": config.SAMPLE_INTERVAL,
            "include_scores": config.INCLUDE_SCORES,
        }
    }

def metric_to_dict(metric: MetricSnapshot, detection: DetectionResult | None = None) -> dict:
    """Convert metric snapshot and optional detection result to dictionary."""
    data = {
        "ts": metric.ts,
        "cpu": metric.cpu,
        "mem": metric.mem,
        "netInBps": metric.netInBps,
        "netOutBps": metric.netOutBps,
        "diskReadBps": metric.diskReadBps,
        "diskWriteBps": metric.diskWriteBps,
    }

    if detection is not None:
        data.update({
            "score_ecod": detection.score_ecod,
            "score_iforest": detection.score_iforest,
            "score_ens": detection.score_ens,
            "threshold": detection.threshold,
            "exceed": detection.exceed,
            "alarm": detection.alarm,
        })

    return data

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """WebSocket endpoint for real-time metrics streaming."""
    await manager.connect(websocket)

    # Initialize collector and optional detector
    collector = MetricsCollector()
    detector: RealtimeDetector | None = None

    if config.INCLUDE_SCORES:
        detector = RealtimeDetector(
            window=config.WINDOW,
            baseline=config.BASELINE,
            threshold_pct=config.THRESHOLD_PCT,
            sustain=config.SUSTAIN,
            ensemble=config.ENSEMBLE,
        )
        logger.info("Detection enabled for this connection")

    try:
        while True:
            # Collect metrics
            metric = collector.collect()

            # Optional: run detection
            detection: DetectionResult | None = None
            if detector is not None:
                detection = detector.process(metric)

            # Convert to JSON and send
            data = metric_to_dict(metric, detection)
            message = json.dumps(data)

            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Error sending message: {e}")
                break

            # Wait for next sample
            await asyncio.sleep(config.SAMPLE_INTERVAL)

    except WebSocketDisconnect:
        logger.info("Client disconnected normally")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)
