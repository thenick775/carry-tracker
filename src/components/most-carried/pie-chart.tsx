import {
  Badge,
  Box,
  getThemeColor,
  useMantineTheme,
  Text
} from '@mantine/core';
import {
  Cell,
  Pie,
  ResponsiveContainer,
  PieChart as ReChartsPieChart,
  Tooltip,
  type PieLabelRenderProps,
  type TooltipContentProps
} from 'recharts';

export type PieChartData = { name: string; value: number; color: string };

type RadialBarChartProps = {
  data: PieChartData[];
};

const renderLabel = ({ x, y, cx, cy, percent = 0 }: PieLabelRenderProps) => (
  <text
    x={x}
    y={y}
    cx={cx}
    cy={cy}
    textAnchor={x > Number(cx) ? 'start' : 'end'}
    fill="var(--chart-labels-color, var(--mantine-color-dimmed))"
    fontFamily="var(--mantine-font-family)"
    fontSize={12}
  >
    <tspan x={x}>{(percent * 100).toFixed(0)}%</tspan>
  </text>
);

export const RenderTooltip = ({
  active,
  payload
}: TooltipContentProps<number | string, string>) => {
  if (!active || !payload?.length) return null;

  const p: PieChartData = payload[0].payload;

  return (
    <Box
      p="xs"
      bg="white"
      c="black"
      style={{
        border: '1px solid var(--mantine-color-gray-4)',
        maxWidth: 'min(260px, 50dvw)'
      }}
    >
      <Text size="sm">
        {p.name}: {p.value}{' '}
        <Badge
          size="xs"
          circle
          color={p.color}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            transform: 'translateY(-1px)'
          }}
        />
      </Text>
    </Box>
  );
};

export const PieChart = ({ data }: RadialBarChartProps) => {
  const theme = useMantineTheme();

  const chartData = data
    .filter(({ value }) => value > 0)
    .map((data) => ({
      ...data,
      fill: getThemeColor(data.color, theme)
    }));

  const cells = chartData.map((item, index) => (
    <Cell
      key={index}
      fill={getThemeColor(item.color, theme)}
      stroke="var(--chart-stroke-color, var(--mantine-color-body))"
      strokeWidth={1}
    />
  ));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReChartsPieChart
        margin={{
          top: 32,
          right: 48,
          bottom: 32,
          left: 48
        }}
      >
        <Pie
          data={chartData}
          innerRadius={0}
          dataKey="value"
          animationBegin={200}
          animationDuration={1200}
          outerRadius="100%"
          label={renderLabel}
          labelLine={{
            stroke: 'var(--chart-label-color, var(--mantine-color-dimmed))',
            strokeWidth: 1
          }}
        >
          {cells}
        </Pie>
        <Tooltip isAnimationActive={false} content={RenderTooltip} />
      </ReChartsPieChart>
    </ResponsiveContainer>
  );
};
