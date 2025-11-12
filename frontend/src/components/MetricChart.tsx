import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { MetricMessage } from '../types';

interface MetricChartProps {
  title: string;
  data: MetricMessage[];
  dataKeys: { key: keyof MetricMessage; name: string; color: string }[];
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
  alarm?: boolean;
  color?: string; // accent color for border like StatCard
}

export const MetricChart = ({
  title,
  data,
  dataKeys,
  yAxisLabel,
  formatValue = (v) => v.toFixed(2),
  alarm = false,
  color = '#2563eb',
}: MetricChartProps) => {
  // Format data for recharts
  const chartData = data.map(point => ({
    ...point,
    timestamp: new Date(point.ts).getTime(),
    timeLabel: format(new Date(point.ts), 'HH:mm:ss'),
  }));

  const bgColor = alarm ? '#fef2f2' : 'white';
  const borderColor = alarm ? '#ef4444' : color;

  return (
    <Card
      sx={{
        height: 420,
        backgroundColor: bgColor,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: `4px solid ${borderColor}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: alarm ? '#ef4444' : 'text.primary',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          {title}
          {alarm && (
            <Box
              component="span"
              sx={{
                fontSize: '1.2rem',
                animation: 'bounce 1s ease-in-out infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-4px)' },
                },
              }}
            >
              ⚠️
            </Box>
          )}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              {dataKeys.map(({ key, color }) => (
                <linearGradient key={key as string} id={`gradient-${key as string}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
              stroke="#9ca3af"
              style={{ fontSize: '0.75rem', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={70}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontWeight: 600 } }}
              stroke="#9ca3af"
              tickFormatter={(v: number) => formatValue(Number(v))}
              style={{ fontSize: '0.75rem', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(timestamp) => format(new Date(timestamp as number), 'HH:mm:ss')}
              formatter={(value: number) => formatValue(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                padding: '12px',
              }}
              itemStyle={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}
              labelStyle={{ color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '0.875rem', fontWeight: 600 }}
              iconType="line"
            />
            {dataKeys.map(({ key, name, color }) => (
              <Line
                key={key as string}
                type="monotone"
                dataKey={key as string}
                name={name}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
