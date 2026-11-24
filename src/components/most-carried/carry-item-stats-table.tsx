import { Table, Badge } from '@mantine/core';

type CarryItemStatsData = {
  name: string;
  value: number;
  color: string;
  id: string;
};

export const CarryItemStatsTable = ({
  data
}: {
  data: CarryItemStatsData[];
}) => {
  const totalCarryCount = data.reduce(
    (acc, chartItem) => acc + chartItem.value,
    0
  );
  const rows = data
    .toSorted(({ value: a }, { value: b }) => b - a)
    .map((chartItem) => (
      <Table.Tr key={chartItem.id}>
        <Table.Td>{chartItem.name}</Table.Td>
        <Table.Td>{chartItem.value.toLocaleString('en-US')}</Table.Td>
        <Table.Td>
          {((chartItem.value / totalCarryCount) * 100).toFixed(0)}
        </Table.Td>
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
          <Table.Th>%</Table.Th>
          <Table.Th>Color</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
        {/* Summary row */}
        <Table.Tr>
          <Table.Td>Summary</Table.Td>
          <Table.Td>{totalCarryCount}</Table.Td>
          <Table.Td />
          <Table.Td />
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};
