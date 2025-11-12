export interface MetricMessage {
  ts: string; // ISO8601 timestamp
  cpu: number; // CPU usage percentage
  mem: number; // Memory usage percentage
  netInBps: number; // Network bytes received per second
  netOutBps: number; // Network bytes sent per second
  diskReadBps: number; // Disk bytes read per second
  diskWriteBps: number; // Disk bytes written per second

  // Optional anomaly detection fields
  score_ecod?: number;
  score_iforest?: number;
  score_ens?: number;
  threshold?: number;
  exceed?: boolean;
  alarm?: boolean;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
