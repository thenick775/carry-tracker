import { Box, Text } from '@mantine/core';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { PieChart } from './most-carried/pie-chart.tsx';
import { StatsTable } from './most-carried/stats-table.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';

export const MostCarriedView = () => {
  const isLargerThanPhone = useIsLargerThanPhone();
  const { carryItems } = useCarryItems();

  const chartData = carryItems?.map(
    ({ id, name, carryCount, cost, color }) => ({
      id,
      name,
      color,
      cost,
      value: carryCount
    })
  );

  return (
    <ResponsiveScrollArea>
      <Text mb="sm">Most Carried:</Text>
      <Box
        w="100%"
        h="100%"
        style={{
          aspectRatio: '1 / 1',
          maxWidth: '100%',
          maxHeight: isLargerThanPhone ? '50dvh' : undefined
        }}
      >
        {!!chartData && (
          <>
            <PieChart data={chartData} />
            <StatsTable data={chartData} />
          </>
        )}
      </Box>
    </ResponsiveScrollArea>
  );
};
