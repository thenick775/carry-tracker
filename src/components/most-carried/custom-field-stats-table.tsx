import { Table, Badge } from '@mantine/core';

type CustomFieldStatsData = {
  name: string;
  value: number;
  color: string;
  id: string;
  carryCount: number;
};

export const CustomFieldStatsTable = ({
  data
}: {
  data: CustomFieldStatsData[];
}) => {
  const totalCount = data.reduce((acc, chartItem) => acc + chartItem.value, 0);
  const rows = data
    .toSorted(
      ({ value: a, carryCount: ac }, { value: b, carryCount: bc }) =>
        b - a || bc - ac
    )
    .map((chartItem) => (
      <Table.Tr key={chartItem.id}>
        <Table.Td>{chartItem.name}</Table.Td>
        <Table.Td>{chartItem.value.toLocaleString('en-US')}</Table.Td>
        <Table.Td>{chartItem.carryCount}</Table.Td>
        <Table.Td>{((chartItem.value / totalCount) * 100).toFixed(0)}</Table.Td>
        <Table.Td>
          <Badge size="xs" circle color={chartItem.color} />
        </Table.Td>
      </Table.Tr>
    ));

  const totalCarryCount = data.reduce(
    (acc, chartItem) => acc + chartItem.carryCount,
    0
  );
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Total</Table.Th>
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
          <Table.Td>{totalCount}</Table.Td>
          <Table.Td>{totalCarryCount}</Table.Td>
          <Table.Td />
          <Table.Td />
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};
