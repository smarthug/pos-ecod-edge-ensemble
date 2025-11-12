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
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.01em',
        },
      },
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
      <Box sx={{ flexGrow: 1, height: '100vh', backgroundColor: 'background.default' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: isAlarm ? 'error.main' : 'primary.main',
            borderBottom: '1px solid',
            borderColor: isAlarm ? 'error.dark' : 'primary.dark',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isAlarm ? '#fff' : 'primary.light',
                  animation: isAlarm ? 'pulse 2s ease-in-out infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                Real-time System Monitoring
                {isAlarm && ' - ALARM ACTIVE'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {getStatusChip()}
              {reconnectAttempts > 0 && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Reconnecting... ({reconnectAttempts})
                </Typography>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4,backgroundColor: 'background.default' }}>
          {isAlarm && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontWeight: 600,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                },
              }}
            >
              ⚠️ Anomaly detected! System metrics exceed threshold.
            </Alert>
          )}

          {/* Current Stats */}
          <Grid container spacing={3} sx={{ mb: 4, width:"100%"}}>
            <Grid size={{ xs: 12, md: 12, lg: 3 }} xs={12} sm={6} md={3}>
              <StatCard
                title="CPU Usage"
                value={lastMessage?.cpu || 0}
                unit="%"
                icon={<SpeedIcon fontSize="large" />}
                color="#2563eb"
                alarm={isAlarm}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 3 }} xs={12} sm={6} md={3}>
              <StatCard
                title="Memory Usage"
                value={lastMessage?.mem || 0}
                unit="%"
                icon={<MemoryIcon fontSize="large" />}
                color="#10b981"
                alarm={isAlarm}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 3 }} xs={12} sm={6} md={3}>
              <StatCard
                title="Network In"
                value={formatBps(lastMessage?.netInBps || 0)}
                icon={<CloudIcon fontSize="large" />}
                color="#f59e0b"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 3 }} xs={12} sm={6} md={3}>
              <StatCard
                title="Network Out"
                value={formatBps(lastMessage?.netOutBps || 0)}
                icon={<CloudIcon fontSize="large" />}
                color="#8b5cf6"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ width: "100%" }}>
            <Grid size={{ xs: 12, md: 12, lg: 6 }}>
              <MetricChart
                title="CPU & Memory Usage"
                data={data}
                dataKeys={[
                  { key: 'cpu', name: 'CPU %', color: '#2563eb' },
                  { key: 'mem', name: 'Memory %', color: '#10b981' },
                ]}
                yAxisLabel="%"
                alarm={isAlarm}
                color="#2563eb"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 6 }} xs={12} md={12} lg={6}>
              <MetricChart
                title="Network Traffic"
                data={data}
                dataKeys={[
                  { key: 'netInBps', name: 'In', color: '#f59e0b' },
                  { key: 'netOutBps', name: 'Out', color: '#8b5cf6' },
                ]}
                yAxisLabel="Bytes/s"
                formatValue={formatBps}
                color="#f59e0b"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 6 }} xs={12} md={12} lg={6}>
              <MetricChart
                title="Disk I/O"
                data={data}
                dataKeys={[
                  { key: 'diskReadBps', name: 'Read', color: '#06b6d4' },
                  { key: 'diskWriteBps', name: 'Write', color: '#ef4444' },
                ]}
                yAxisLabel="Bytes/s"
                formatValue={formatBps}
                color="#06b6d4"
              />
            </Grid>
            {hasScores && (
              <>
                <Grid size={{ xs: 12, md: 12, lg: 6 }} xs={12} md={12} lg={6}>
                  <MetricChart
                    title="Ensemble Score"
                    data={data}
                    dataKeys={[
                      { key: 'score_ens', name: 'Ensemble', color: '#ef4444' },
                      { key: 'threshold', name: 'Threshold', color: '#f59e0b' },
                    ]}
                    yAxisLabel="Score"
                    alarm={isAlarm}
                    color="#ef4444"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12, lg: 6 }} xs={12} md={12} lg={6}>
                  <MetricChart
                    title="ECOD Score"
                    data={data}
                    dataKeys={[
                      { key: 'score_ecod', name: 'ECOD', color: '#3b82f6' },
                      { key: 'threshold', name: 'Threshold', color: '#f59e0b' },
                    ]}
                    yAxisLabel="Score"
                    alarm={isAlarm}
                    color="#3b82f6"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12, lg: 6 }} xs={12} md={12} lg={6}>
                  <MetricChart
                    title="Isolation Forest Score"
                    data={data}
                    dataKeys={[
                      { key: 'score_iforest', name: 'Isolation Forest', color: '#10b981' },
                      { key: 'threshold', name: 'Threshold', color: '#f59e0b' },
                    ]}
                    yAxisLabel="Score"
                    alarm={isAlarm}
                    color="#10b981"
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Footer Info */}
          <Box sx={{ mt: 5, mb: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {data.length > 0 && `📊 Displaying last ${data.length} data points`}
              {hasScores && ' • 🔍 Anomaly detection enabled'}
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
