import { Box, Button, Chip, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import randomColor from 'randomcolor';
import { useState } from 'react';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { CarryItemStatsTable } from './most-carried/carry-item-stats-table.tsx';
import { PieChart } from './most-carried/pie-chart.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';
import { CustomFieldStatsTable } from './most-carried/custom-field-stats-table.tsx';
import { LineChart } from './most-carried/line-chart.tsx';
import { SeriesPickerDrawer } from './most-carried/series-picker-drawer.tsx';

export const CarryStatsView = () => {
  const isLargerThanPhone = useIsLargerThanPhone();
  const { carryItems } = useCarryItems();
  const [viewKey, setViewKey] = useState<string>('items');
  const [
    seriesPickerOpened,
    { open: openSeriesPicker, close: closeSeriesPicker }
  ] = useDisclosure(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(null);

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
  const sortedItemData = itemData.toSorted(
    ({ value: a }, { value: b }) => b - a
  );
  const topItemIds = sortedItemData.slice(0, 5).map(({ id }) => id);
  const itemIds = itemData.map(({ id }) => id);

  const customFieldsData = Object.entries(
    (carryItems ?? []).reduce<
      Record<string, { total: number; carryCount: number; cost?: number }>
    >((acc, item) => {
      item.customFields
        ?.filter((c) => c.name === viewKey)
        .forEach((customField) => {
          const prev = acc[customField.value] ?? {
            total: 0,
            cost: 0,
            carryCount: 0
          };

          acc[customField.value] = {
            total: prev.total + 1,
            cost: (prev.cost ?? 0) + (item.cost ?? 0),
            carryCount: prev.carryCount + item.carryCount
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
  const visibleItemIdSet = new Set(itemIds);
  const effectiveSelectedItemIds =
    selectedItemIds === null
      ? itemIds
      : selectedItemIds.filter((id) => visibleItemIdSet.has(id));

  const toggleSelectedItem = (itemId: string) =>
    setSelectedItemIds((current) => {
      const base = current ?? itemIds;

      return base.includes(itemId)
        ? base.filter((id) => id !== itemId)
        : [...base, itemId];
    });

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
          <LineChart
            data={itemData}
            selectedItemIds={effectiveSelectedItemIds}
            controlsRightSection={
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<TbAdjustmentsHorizontal size={14} />}
                onClick={openSeriesPicker}
              >
                Series ({effectiveSelectedItemIds.length})
              </Button>
            }
          />
        ) : (
          <PieChart data={chartData} />
        )}
      </Box>

      {isViewingItemsOverTime ? (
        <CarryItemStatsTable data={itemData} />
      ) : isViewingItems ? (
        <CarryItemStatsTable data={itemData} />
      ) : (
        <CustomFieldStatsTable data={customFieldsData} />
      )}

      <SeriesPickerDrawer
        opened={seriesPickerOpened}
        onClose={closeSeriesPicker}
        onShowAll={() => setSelectedItemIds(null)}
        onShowTopFive={() => setSelectedItemIds(topItemIds)}
        onClearSelection={() => setSelectedItemIds([])}
        items={sortedItemData}
        selectedItemIds={effectiveSelectedItemIds}
        onToggleItem={toggleSelectedItem}
      />
    </ResponsiveScrollArea>
  );
};
