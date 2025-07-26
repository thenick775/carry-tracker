import { Table, Badge } from '@mantine/core';

import type { PieChartData } from './pie-chart';

const currencyFormatterUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const StatsTable = ({
  data
}: {
  data: (PieChartData & { id: string; cost?: number })[];
}) => {
  const total = data.reduce((acc, { value }) => acc + value, 0);
  const rows = data
    .sort(({ value: a }, { value: b }) => b - a)
    .map((chartItem) => (
      <Table.Tr key={chartItem.id}>
        <Table.Td>{chartItem.name}</Table.Td>
        <Table.Td>{chartItem.value.toLocaleString('en-US')}</Table.Td>
        <Table.Td>
          {chartItem.cost ? currencyFormatterUSD.format(chartItem.cost) : ''}
        </Table.Td>
        <Table.Td>{((chartItem.value / total) * 100).toFixed(0)}</Table.Td>
        <Table.Td>
          <Badge size="xs" circle color={chartItem.color} />
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Carry Count</Table.Th>
          <Table.Th>Cost</Table.Th>
          <Table.Th>%</Table.Th>
          <Table.Th>Color</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
