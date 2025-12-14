import { Box, Chip, Group, Text } from '@mantine/core';
import { useState } from 'preact/hooks';
import randomColor from 'randomcolor';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { CarryItemStatsTable } from './most-carried/carry-item-stats-table.tsx';
import { PieChart } from './most-carried/pie-chart.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';
import { CustomFieldStatsTable } from './most-carried/custom-field-stats-table.tsx';
import { LineChart } from './most-carried/line-chart.tsx';

export const CarryStatsView = () => {
  const isLargerThanPhone = useIsLargerThanPhone();
  const { carryItems } = useCarryItems();
  const [viewKey, setViewKey] = useState<string>('items');

  const customFieldNames = Array.from(
    new Set(
      carryItems?.flatMap((item) => item.customFields?.map((c) => c.name) ?? [])
    )
  );

  const itemData =
    carryItems?.map(({ id, name, carryCount, cost, color }) => ({
      id,
      name,
      color,
      cost,
      value: carryCount
    })) ?? [];

  const customFieldsData = Object.entries(
    (carryItems ?? []).reduce<
      Record<string, { total: number; carryCount: number; cost?: number }>
    >((acc, item) => {
      item.customFields
        ?.filter((c) => c.name === viewKey)
        ?.forEach((customField) => {
          acc[customField.value] = {
            total: (acc[customField.value]?.total ?? 0) + 1,
            cost: (acc[customField.value]?.cost ?? 0) + (item?.cost ?? 0),
            carryCount:
              (acc[customField.value]?.carryCount ?? 0) + item.carryCount
          };
        });

      return acc;
    }, {})
  ).map(([name, { total, cost, carryCount }]) => ({
    id: name,
    name,
    carryCount,
    cost,
    value: total,
    color: randomColor({ seed: name })
  }));

  const isViewingItems = viewKey === 'items';
  const isViewingItemsOverTime = viewKey === 'items-over-time';
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
        <Group gap="xs" wrap="nowrap" mb="xs">
          <Chip
            size="xs"
            checked={isViewingItems}
            onChange={() => setViewKey('items')}
            variant="light"
          >
            Items
          </Chip>
          <Chip
            size="xs"
            checked={isViewingItemsOverTime}
            onChange={() => setViewKey('items-over-time')}
            variant="light"
          >
            Items over time
          </Chip>
        </Group>
        <Group gap="xs" wrap="nowrap">
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
        {isViewingItemsOverTime ? (
          <>
            <LineChart data={itemData} />
            <CarryItemStatsTable data={itemData} />
          </>
        ) : (
          <>
            <PieChart data={chartData} />
            {isViewingItems ? (
              <CarryItemStatsTable data={itemData} />
            ) : (
              <CustomFieldStatsTable data={customFieldsData} />
            )}
          </>
        )}
      </Box>
    </ResponsiveScrollArea>
  );
};
