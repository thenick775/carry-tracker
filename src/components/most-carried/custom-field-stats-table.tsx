import { Table, Badge } from '@mantine/core';

import type { PieChartData } from './pie-chart';

const currencyFormatterUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const CustomFieldStatsTable = ({
  data
}: {
  data: (PieChartData & {
    id: string;
    cost?: number;
    carryCount: number;
  })[];
}) => {
  const totalCarryCount = data.reduce(
    (acc, chartItem) => acc + chartItem.carryCount,
    0
  );
  const rows = data
    .sort(({ value: a }, { value: b }) => b - a)
    .map((chartItem) => (
      <Table.Tr key={chartItem.id}>
        <Table.Td>{chartItem.name}</Table.Td>
        <Table.Td>{chartItem.value.toLocaleString('en-US')}</Table.Td>
        <Table.Td>{chartItem.carryCount}</Table.Td>
        <Table.Td>
          {chartItem.cost ? currencyFormatterUSD.format(chartItem.cost) : '?'}
        </Table.Td>
        <Table.Td>
          {((chartItem.value / totalCarryCount) * 100).toFixed(0)}
        </Table.Td>
        <Table.Td>
          <Badge size="xs" circle color={chartItem.color} />
        </Table.Td>
      </Table.Tr>
    ));

  const totalCount = data.reduce(
    (acc, chartItem) => acc + (chartItem?.value ?? 0),
    0
  );
  const totalCost = data.reduce(
    (acc, chartItem) => acc + (chartItem.cost ?? 0),
    0
  );

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Total</Table.Th>
          <Table.Th>Carry Count</Table.Th>
          <Table.Th>Cost</Table.Th>
          <Table.Th>%</Table.Th>
          <Table.Th>Color</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
        {/* Summary row */}
        <Table.Tr>
          <Table.Td>Summary</Table.Td>
          <Table.Td>{totalCount}</Table.Td>
          <Table.Td>{totalCarryCount}</Table.Td>
          <Table.Td>{currencyFormatterUSD.format(totalCost)}</Table.Td>
          <Table.Td />
          <Table.Td />
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};
