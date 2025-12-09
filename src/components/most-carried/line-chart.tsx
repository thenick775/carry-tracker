import { Group, ActionIcon, Text, SegmentedControl } from '@mantine/core';
import dayjs from 'dayjs';
import { useState } from 'preact/hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export type CarryDayPoint = {
  id: string;
  name: string;
  date: Date;
  carryCountForDay: number;
  color: string;
};

type MultiItemLineChartProps = {
  points: CarryDayPoint[];
};

type ChartMode = 'week' | 'month' | 'year';

const getBucketInfo = (date: Date, mode: ChartMode) => {
  let d = dayjs(date).startOf('day');

  switch (mode) {
    case 'week': {
      const day = d.day();
      d = d.subtract(day, 'day');
      break;
    }

    case 'month':
      d = d.startOf('month');
      break;

    case 'year':
      d = d.startOf('year');
      break;
  }

  const key = d.format('YYYY-MM-DD');
  return { key, startMs: d.valueOf() };
};

const bucketAll = (points: CarryDayPoint[], mode: ChartMode) => {
  if (!points.length) return [];

  const buckets = new Map<string, Record<string, number>>();

  for (const p of points) {
    const { key, startMs } = getBucketInfo(p.date, mode);

    if (!buckets.has(key)) {
      buckets.set(key, { date: startMs });
    }

    const row = buckets.get(key)!;
    row[p.name] = (row[p.name] ?? 0) + p.carryCountForDay;
  }

  return Array.from(buckets.values()).sort((a, b) => a.date - b.date);
};

const extractItemColors = (points: CarryDayPoint[]) => {
  const map = new Map<string, string>();
  for (const p of points) {
    if (!map.has(p.name)) map.set(p.name, p.color);
  }
  return map;
};

const formatXAxisTick = (value: number, mode: ChartMode) => {
  const d = dayjs(value);

  if (mode === 'week') {
    return d.format('MMM D');
  }

  if (mode === 'month') {
    return d.format('MMM YY');
  }

  return d.format('YYYY');
};

const formatTooltipLabel = (value: number, mode: ChartMode) => {
  const d = dayjs(value);

  if (mode === 'week') {
    return `Week of ${d.format('MMM D, YYYY')}`;
  }

  if (mode === 'month') {
    return d.format('MMMM YYYY');
  }

  return d.format('YYYY');
};

export const MultiItemLineChart = ({ points }: MultiItemLineChartProps) => {
  const [mode, setMode] = useState<ChartMode>('week');
  const [page, setPage] = useState(0);
  const allBuckets = bucketAll(points, mode);
  const itemColors = extractItemColors(points);
  const itemNames = Array.from(itemColors.keys());

  const windowSize = 7;
  const totalPages = Math.max(1, Math.ceil(allBuckets.length / windowSize));
  const clampedPage = Math.min(page, totalPages - 1);

  const start = Math.max(0, allBuckets.length - windowSize * (clampedPage + 1));
  const end = allBuckets.length - windowSize * clampedPage;
  const data = allBuckets.slice(start, end);

  const ticks = data.map((row) => row.date);

  const maxValue = points.length
    ? Math.max(...points.map((p) => p.carryCountForDay))
    : 0;
  const digitCount = String(maxValue || 0).length;
  const yAxisWidth = Math.max(26, digitCount * 10);

  const canGoOlder = clampedPage < totalPages - 1;
  const canGoNewer = clampedPage > 0;

  const handleOlder = () => {
    if (!canGoOlder) return;
    setPage((p) => Math.min(p + 1, totalPages - 1));
  };

  const handleNewer = () => {
    if (!canGoNewer) return;
    setPage((p) => Math.max(p - 1, 0));
  };

  const rangeLabel = data.length
    ? `${dayjs(data[0].date).format(
        mode === 'year' ? 'MMM D, YYYY' : 'MMM D'
      )} - ${dayjs(data[data.length - 1].date).format(
        mode === 'year' ? 'MMM D, YYYY' : 'MMM D'
      )}`
    : '';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Group justify="space-between" align="center" mb={4} gap="xs">
        <ActionIcon
          size="sm"
          variant="subtle"
          aria-label="Older period"
          onClick={handleOlder}
          disabled={!canGoOlder}
        >
          ←
        </ActionIcon>

        <Text size="xs" c="dimmed" ta="center" style={{ flex: 1 }}>
          {rangeLabel || 'No data'}
        </Text>

        <ActionIcon
          size="sm"
          variant="subtle"
          aria-label="Newer period"
          onClick={handleNewer}
          disabled={!canGoNewer}
        >
          →
        </ActionIcon>
      </Group>

      <LineChart
        responsive
        data={data}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: 1.6
        }}
        margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.10)" />

        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          domain={
            ticks.length
              ? [ticks[0], ticks[ticks.length - 1]]
              : ['auto', 'auto']
          }
          ticks={ticks}
          tickFormatter={(v) => formatXAxisTick(v, mode)}
        />

        <YAxis width={yAxisWidth} axisLine={false} />

        <Tooltip
          isAnimationActive={false}
          labelFormatter={(v) => formatTooltipLabel(v, mode)}
          labelStyle={{ color: 'var(--mantine-color-dimmed)' }}
        />

        {itemNames.map((name) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            name={name}
            stroke={itemColors.get(name)}
            strokeWidth={2.4}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
      <Group justify="center" mb="sm">
        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as ChartMode)}
          data={[
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
            { label: 'Year', value: 'year' }
          ]}
          size="xs"
          color="blue"
        />
      </Group>
    </div>
  );
};
