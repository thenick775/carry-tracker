import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';
import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { CarryHistoryDraftEntry } from '../../hooks/use-carries-over-time';

const formatRecordedAt = (value?: string) =>
  value ? dayjs(value).format('MMM DD, YYYY hh:mm:ss A') : 'Not recorded';

export const CarryHistoryChart = ({
  entries,
  color
}: {
  entries: CarryHistoryDraftEntry[];
  color: string;
}) => {
  const points = entries
    .filter((entry) => dayjs(entry.createdAt).isValid())
    .map((entry) => ({
      date: dayjs(entry.createdAt).valueOf(),
      count: entry.currentCarryCount
    }))
    .toSorted((a, b) => a.date - b.date);

  const maxYValue = Math.max(...points.map(({ count }) => count), 0);
  const digitCount = String(maxYValue || 0).length;
  const yAxisWidth = Math.max(26, digitCount * 15);

  return (
    <Box
      h="100%"
      w="100%"
      style={{
        aspectRatio: '2 / 1'
      }}
    >
      {points.length < 1 && (
        <Box
          h="75%"
          display="flex"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Text size="sm" c="dimmed" ta="center">
            At least one history entry is required.
          </Text>
        </Box>
      )}
      {points.length >= 1 && (
        <ReLineChart
          responsive
          data={points}
          style={{ width: '100%', height: '100%' }}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.10)"
          />

          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={[points[0].date, points[points.length - 1].date]}
            tickFormatter={(value: number) => dayjs(value).format('MMM D')}
          />

          <YAxis
            width={yAxisWidth}
            allowDecimals={false}
            axisLine={false}
            domain={[0, maxYValue]}
          />

          <Tooltip
            isAnimationActive={false}
            labelFormatter={(value) =>
              formatRecordedAt(dayjs(Number(value)).toISOString())
            }
            labelStyle={{ color: 'black' }}
          />

          <Line
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ReLineChart>
      )}
    </Box>
  );
};
