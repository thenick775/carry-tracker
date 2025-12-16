import { Group, ActionIcon, Text, SegmentedControl } from '@mantine/core';
import dayjs from 'dayjs';
import { useState } from 'preact/hooks';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

import {
  useCarriesOverTime,
  type ChartMode
} from '../../hooks/use-carries-over-time.ts';

type ItemData = {
  id: string;
  name: string;
  color: string;
};

type MultiItemLineChartProps = {
  data: ItemData[];
};

type carryDataPoint = ItemData & {
  date: Date;
  count: number;
};

const PERIOD_LOOK_BACK = 7;

const getBucketInfo = (date: Date, mode: ChartMode) => {
  let d = dayjs(date).startOf('day');

  switch (mode) {
    case 'week':
      d = d.startOf('week');
      break;

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

const bucketAll = (points: carryDataPoint[], mode: ChartMode) => {
  if (!points.length) return [];

  const buckets = new Map<string, Record<string, number>>();

  for (const p of points) {
    const { key, startMs } = getBucketInfo(p.date, mode);

    if (!buckets.has(key)) {
      buckets.set(key, { date: startMs });
    }

    const row = buckets.get(key)!;
    // could also use p.count and do some math if we want to sum counts instead of occurrences later
    row[p.name] = (row[p.name] ?? 0) + 1;
  }

  return Array.from(buckets.values()).sort((a, b) => a.date - b.date);
};

const extractItemColors = (points: carryDataPoint[]) => {
  const map = new Map<string, string>();
  for (const p of points) {
    if (!map.has(p.name)) map.set(p.name, p.color);
  }
  return map;
};

const formatXAxisTick = (value: number, mode: ChartMode) => {
  const d = dayjs(value);

  if (mode === 'day' || mode === 'week') {
    return d.format('MMM D');
  }

  if (mode === 'month') {
    return d.format('MMM YY');
  }

  return d.format('YYYY');
};

const formatTooltipLabel = (value: number, mode: ChartMode) => {
  const d = dayjs(value);

  if (mode === 'day') {
    return d.format('MMM D');
  }

  if (mode === 'week') {
    return `Week of ${d.format('MMM D, YYYY')}`;
  }

  if (mode === 'month') {
    return d.format('MMMM YYYY');
  }

  return d.format('YYYY');
};

export const LineChart = ({ data }: MultiItemLineChartProps) => {
  const [mode, setMode] = useState<ChartMode>('week');
  const carriesOverTime = useCarriesOverTime(mode, PERIOD_LOOK_BACK);
  const [page, setPage] = useState(0);

  const points: carryDataPoint[] | undefined = carriesOverTime?.map((cot) => {
    const item = data.find((d) => d.id === cot.carryItemId);
    return {
      id: cot.carryItemId,
      name: item ? item.name : 'Unknown Item',
      date: dayjs(cot.createdAt).toDate(),
      count: cot.currentCarryCount,
      color: item ? item.color : '#888888'
    };
  });

  if (!points) return;

  const itemColors = extractItemColors(points);
  const itemNames = Array.from(itemColors.keys());
  const allBuckets = bucketAll(points, mode).map((row) => {
    const next = { ...row };
    for (const name of itemNames) {
      next[name] ??= 0;
    }
    return next;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(allBuckets.length / PERIOD_LOOK_BACK)
  );
  const clampedPage = Math.min(page, totalPages - 1);

  const start = Math.max(
    0,
    allBuckets.length - PERIOD_LOOK_BACK * (clampedPage + 1)
  );
  const end = allBuckets.length - PERIOD_LOOK_BACK * clampedPage;
  const buckets = allBuckets.slice(start, end);

  console.log('vancise buckets', buckets);

  const ticks = buckets.map((row) => row.date);

  const maxValue = points.length ? Math.max(...points.map((p) => p.count)) : 0;
  const digitCount = String(maxValue || 0).length;
  const yAxisWidth = Math.max(26, digitCount * 15);

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

  const rangeLabel = buckets.length
    ? `${dayjs(buckets[0].date).format(
        mode === 'year' ? 'MMM D, YYYY' : 'MMM D'
      )} - ${dayjs(buckets[buckets.length - 1].date).format(
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

      <ReLineChart
        responsive
        data={buckets}
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
          itemSorter={({ value }) => -(value ?? 0)}
          labelStyle={{ color: 'var(--mantine-color-dimmed)' }}
          wrapperStyle={{ zIndex: 10000 }}
          formatter={(value, name) => {
            if (value === 0) return null;
            return [value, name];
          }}
        />

        {itemNames.map((name) => (
          <Line
            connectNulls
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
      </ReLineChart>
      <Group justify="center" mb="sm">
        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as ChartMode)}
          data={[
            { label: 'Day', value: 'day' },
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
