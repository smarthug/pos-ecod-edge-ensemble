import { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Box,
  Chip,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { useWebSocket } from './hooks/useWebSocket';
import { useTimeseries } from './hooks/useTimeseries';
import { StatCard } from './components/StatCard';
import { MetricChart } from './components/MetricChart';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/metrics';

function App() {
  const { lastMessage, status, reconnectAttempts } = useWebSocket({ url: WS_URL });
  const { data, addPoint } = useTimeseries({ maxLength: 300 });

  // Add new data point when message arrives
  useEffect(() => {
    if (lastMessage) {
      addPoint(lastMessage);
    }
  }, [lastMessage, addPoint]);

  // Format bytes per second to human readable
  const formatBps = (bps: number): string => {
    if (bps < 1024) return `${bps.toFixed(0)} B/s`;
    if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(2)} KB/s`;
    return `${(bps / (1024 * 1024)).toFixed(2)} MB/s`;
  };

  // Get connection status chip
  const getStatusChip = () => {
    const statusMap = {
      connecting: { label: 'Connecting...', color: 'warning' as const },
      connected: { label: 'Connected', color: 'success' as const },
      disconnected: { label: 'Disconnected', color: 'error' as const },
      error: { label: 'Error', color: 'error' as const },
    };
    const { label, color } = statusMap[status];
    return <Chip label={label} color={color} size="small" />;
  };

  const isAlarm = lastMessage?.alarm || false;
  const hasScores = lastMessage?.score_ens !== undefined;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: isAlarm ? '#f44336' : undefined }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Real-time System Monitoring
              {isAlarm && ' - ALARM ACTIVE'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {getStatusChip()}
              {reconnectAttempts > 0 && (
                <Typography variant="body2">Reconnect attempts: {reconnectAttempts}</Typography>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {isAlarm && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Anomaly detected! System metrics exceed threshold.
            </Alert>
          )}

          {/* Current Stats */}
          <Grid container spacing={3} sx={{ mb: 3, width:"100%" }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="CPU Usage"
                value={lastMessage?.cpu || 0}
                unit="%"
                icon={<SpeedIcon fontSize="large" />}
                color="#1976d2"
                alarm={isAlarm}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Memory Usage"
                value={lastMessage?.mem || 0}
                unit="%"
                icon={<MemoryIcon fontSize="large" />}
                color="#2e7d32"
                alarm={isAlarm}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Network In"
                value={formatBps(lastMessage?.netInBps || 0)}
                icon={<CloudIcon fontSize="large" />}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Network Out"
                value={formatBps(lastMessage?.netOutBps || 0)}
                icon={<CloudIcon fontSize="large" />}
                color="#9c27b0"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MetricChart
                title="CPU & Memory Usage"
                data={data}
                dataKeys={[
                  { key: 'cpu', name: 'CPU %', color: '#1976d2' },
                  { key: 'mem', name: 'Memory %', color: '#2e7d32' },
                ]}
                yAxisLabel="%"
                alarm={isAlarm}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MetricChart
                title="Network Traffic"
                data={data}
                dataKeys={[
                  { key: 'netInBps', name: 'In', color: '#ed6c02' },
                  { key: 'netOutBps', name: 'Out', color: '#9c27b0' },
                ]}
                yAxisLabel="Bytes/s"
                formatValue={formatBps}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MetricChart
                title="Disk I/O"
                data={data}
                dataKeys={[
                  { key: 'diskReadBps', name: 'Read', color: '#0288d1' },
                  { key: 'diskWriteBps', name: 'Write', color: '#d32f2f' },
                ]}
                yAxisLabel="Bytes/s"
                formatValue={formatBps}
              />
            </Grid>
            {hasScores && (
              <Grid item xs={12} md={6}>
                <MetricChart
                  title="Anomaly Score"
                  data={data}
                  dataKeys={[
                    { key: 'score_ens', name: 'Ensemble Score', color: '#f44336' },
                    { key: 'threshold', name: 'Threshold', color: '#ff9800' },
                  ]}
                  yAxisLabel="Score"
                  alarm={isAlarm}
                />
              </Grid>
            )}
          </Grid>

          {/* Footer Info */}
          <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              {data.length > 0 && `Displaying last ${data.length} data points`}
              {hasScores && ' | Anomaly detection enabled'}
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
