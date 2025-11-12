
from __future__ import annotations
import time
import psutil
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timezone

@dataclass
class MetricSnapshot:
    """System metrics at a point in time."""
    ts: str  # ISO8601 timestamp
    cpu: float  # CPU usage percentage
    mem: float  # Memory usage percentage
    netInBps: float  # Network bytes received per second
    netOutBps: float  # Network bytes sent per second
    diskReadBps: float  # Disk bytes read per second
    diskWriteBps: float  # Disk bytes written per second

class MetricsCollector:
    """Collects system metrics using psutil with differential calculation for I/O."""

    def __init__(self):
        self._prev_net: Optional[psutil._common.snetio] = None
        self._prev_disk: Optional[psutil._common.sdiskio] = None
        self._prev_time: Optional[float] = None

        # Prime CPU percent (first call returns meaningless value)
        psutil.cpu_percent(interval=None)

    def collect(self) -> MetricSnapshot:
        """Collect current system metrics."""
        current_time = time.time()

        # CPU and Memory are instantaneous
        cpu_pct = psutil.cpu_percent(interval=None)
        mem_pct = psutil.virtual_memory().percent

        # Network and Disk require differential calculation
        net_io = psutil.net_io_counters()
        disk_io = psutil.disk_io_counters()

        # Calculate rates
        net_in_bps = 0.0
        net_out_bps = 0.0
        disk_read_bps = 0.0
        disk_write_bps = 0.0

        if self._prev_net is not None and self._prev_disk is not None and self._prev_time is not None:
            elapsed = current_time - self._prev_time

            if elapsed > 0:
                # Network rates
                net_in_bytes = net_io.bytes_recv - self._prev_net.bytes_recv
                net_out_bytes = net_io.bytes_sent - self._prev_net.bytes_sent
                net_in_bps = max(0.0, net_in_bytes / elapsed)
                net_out_bps = max(0.0, net_out_bytes / elapsed)

                # Disk rates
                disk_read_bytes = disk_io.read_bytes - self._prev_disk.read_bytes
                disk_write_bytes = disk_io.write_bytes - self._prev_disk.write_bytes
                disk_read_bps = max(0.0, disk_read_bytes / elapsed)
                disk_write_bps = max(0.0, disk_write_bytes / elapsed)

        # Update previous values
        self._prev_net = net_io
        self._prev_disk = disk_io
        self._prev_time = current_time

        # Create snapshot with ISO8601 timestamp
        ts_iso = datetime.now(timezone.utc).isoformat()

        return MetricSnapshot(
            ts=ts_iso,
            cpu=cpu_pct,
            mem=mem_pct,
            netInBps=net_in_bps,
            netOutBps=net_out_bps,
            diskReadBps=disk_read_bps,
            diskWriteBps=disk_write_bps,
        )
