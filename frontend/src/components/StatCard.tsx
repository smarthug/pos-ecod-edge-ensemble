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

export const StatCard = ({ title, value, unit, icon, color = '#2563eb', alarm = false }: StatCardProps) => {
  const isNumber = typeof value === 'number';
  const displayValue = isNumber ? (value as number).toFixed(2) : value;
  const bgColor = alarm ? '#fef2f2' : 'white';
  const borderColor = alarm ? '#ef4444' : color;

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: bgColor,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography
            color="textSecondary"
            variant="body2"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                color: alarm ? '#ef4444' : color,
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            color: alarm ? '#ef4444' : 'text.primary',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            alignItems: 'baseline',
            gap: 0.5,
            fontWeight: 700,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              textAlign: 'left',
              minWidth: isNumber ? '5ch' : '10ch',
            }}
          >
            {displayValue}
          </Box>
          {unit && (
            <Typography
              component="span"
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              {unit}
            </Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
};
