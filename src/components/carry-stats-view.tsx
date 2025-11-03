import { Box, Chip, Group, Text } from '@mantine/core';
import { useState } from 'preact/hooks';
import randomColor from 'randomcolor';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { PieChart } from './most-carried/pie-chart.tsx';
import { StatsTable } from './most-carried/stats-table.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';

export const CarryStatsView = () => {
  const isLargerThanPhone = useIsLargerThanPhone();
  const { carryItems } = useCarryItems();
  const [viewKey, setViewKey] = useState<string>('items');

  const customFieldNames = Array.from(
    new Set(
      carryItems?.flatMap((item) => item.customFields?.map((c) => c.name) ?? [])
    )
  );

  const itemData = carryItems?.map(({ id, name, carryCount, cost, color }) => ({
    id,
    name,
    color,
    cost,
    value: carryCount
  }));

  const customFieldsData = Object.entries(
    (carryItems ?? []).reduce<Record<string, { total: number; cost?: number }>>(
      (acc, item) => {
        item.customFields
          ?.filter((c) => c.name === viewKey)
          ?.forEach((customField) => {
            acc[customField.value] = {
              total: (acc[customField.value]?.total ?? 0) + 1,
              cost: (acc[customField.value]?.cost ?? 0) + (item?.cost ?? 0)
            };
          });

        return acc;
      },
      {}
    )
  ).map(([name, { total, cost }]) => ({
    id: name,
    name: name,
    value: total,
    cost: cost,
    color: randomColor({ seed: name })
  }));

  const isViewingItems = viewKey === 'items';
  const chartData = isViewingItems ? itemData : customFieldsData;

  return (
    <ResponsiveScrollArea>
      <Text mb="sm">Carry Stats:</Text>

      <Box
        mb="sm"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <Group gap="xs" wrap="nowrap">
          <Chip
            size="xs"
            checked={viewKey === 'items'}
            onChange={() => setViewKey('items')}
            variant="light"
          >
            Items
          </Chip>

          {customFieldNames.map((name) => (
            <Chip
              key={name}
              size="xs"
              checked={viewKey === name}
              onChange={() => setViewKey(name)}
              variant="light"
            >
              {name}
            </Chip>
          ))}
        </Group>
      </Box>

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
            <StatsTable
              data={chartData}
              countColumnName={isViewingItems ? undefined : 'Count'}
            />
          </>
        )}
      </Box>
    </ResponsiveScrollArea>
  );
};
