import { Card, CardContent, Typography } from '@mui/material';
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
}

export const MetricChart = ({
  title,
  data,
  dataKeys,
  yAxisLabel,
  formatValue = (v) => v.toFixed(2),
  alarm = false,
}: MetricChartProps) => {
  // Format data for recharts
  const chartData = data.map(point => ({
    ...point,
    timestamp: new Date(point.ts).getTime(),
    timeLabel: format(new Date(point.ts), 'HH:mm:ss'),
  }));

  const bgColor = alarm ? '#ffebee' : 'white';

  return (
    <Card sx={{ height: '100%', backgroundColor: bgColor, transition: 'all 0.3s ease' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: alarm ? '#f44336' : 'inherit' }}>
          {title}
          {alarm && ' ⚠️'}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss')}
              stroke="#666"
            />
            <YAxis
              width={64}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              stroke="#666"
              tickFormatter={(v: number) => formatValue(Number(v))}
            />
            <Tooltip
              labelFormatter={(timestamp) => format(new Date(timestamp as number), 'HH:mm:ss')}
              formatter={(value: number) => formatValue(value)}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
            />
            <Legend />
            {dataKeys.map(({ key, name, color }) => (
              <Line
                key={key as string}
                type="monotone"
                dataKey={key as string}
                name={name}
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
