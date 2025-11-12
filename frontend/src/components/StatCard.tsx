import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  alarm?: boolean;
}

export const StatCard = ({ title, value, unit, icon, color = '#1976d2', alarm = false }: StatCardProps) => {
  const isNumber = typeof value === 'number';
  const displayValue = isNumber ? (value as number).toFixed(2) : value;
  const bgColor = alarm ? '#ffebee' : 'white';
  const borderColor = alarm ? '#f44336' : color;

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: bgColor,
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                color: alarm ? '#f44336' : 'inherit',
                // Prevent layout shift as numbers change
                fontVariantNumeric: 'tabular-nums',
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                  width: isNumber ? '10ch' : '16ch',
                }}
              >
                {displayValue}
              </Box>
              {unit && (
                <Typography component="span" variant="h6" color="textSecondary" sx={{ ml: 0.5 }}>
                  {unit}
                </Typography>
              )}
            </Typography>
          </Box>
          {icon && (
            <Box sx={{ color: alarm ? '#f44336' : color, opacity: 0.7 }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
