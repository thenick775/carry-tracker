import { Box, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { PieChart } from './pie-chart.tsx';
import { StatsTable } from './stats-table.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';

export const MostCarriedView = () => {
  const theme = useMantineTheme();
  const isLargerThanPhone = useMediaQuery(
    `(min-width: ${theme.breakpoints.sm})`
  );
  const { carryItems } = useCarryItems();

  const chartData = carryItems?.map(({ id, name, carryCount, color }) => ({
    id,
    name,
    color,
    value: carryCount,
  }));

  return (
    <>
      <Text mb="sm">Most Carried:</Text>
      <Box
        w="100%"
        h="100%"
        style={{
          aspectRatio: '1 / 1',
          maxWidth: '100%',
          maxHeight: isLargerThanPhone ? '50dvh' : undefined,
        }}
      >
        {!!chartData && (
          <>
            <PieChart data={chartData} />
            <StatsTable data={chartData} />
          </>
        )}
      </Box>
    </>
  );
};
