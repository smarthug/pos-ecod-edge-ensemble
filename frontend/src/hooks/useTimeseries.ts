import { useState, useCallback } from 'react';
import type { MetricMessage } from '../types';

interface UseTimeseriesOptions {
  maxLength?: number;
}

export const useTimeseries = ({ maxLength = 300 }: UseTimeseriesOptions = {}) => {
  const [data, setData] = useState<MetricMessage[]>([]);

  const addPoint = useCallback((point: MetricMessage) => {
    setData(prevData => {
      const newData = [...prevData, point];
      // Keep only the last maxLength points
      if (newData.length > maxLength) {
        return newData.slice(newData.length - maxLength);
      }
      return newData;
    });
  }, [maxLength]);

  const clear = useCallback(() => {
    setData([]);
  }, []);

  return { data, addPoint, clear };
};
