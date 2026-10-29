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
  const [viewMode, setViewMode] = useState<'items' | 'items-over-time'>(
    'items'
  );
  const [selectedTagField, setSelectedTagField] = useState<string | null>(null);
  const [
    seriesPickerOpened,
    { open: openSeriesPicker, close: closeSeriesPicker }
  ] = useDisclosure(false);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<string[] | null>(
    null
  );

  const customFieldNames = Array.from(
    new Set(
      carryItems?.flatMap((item) => item.customFields?.map((c) => c.name) ?? [])
    )
  ).toSorted();

  const itemData =
    carryItems?.map(({ id, name, carryCount, cost, color, customFields }) => ({
      id,
      name,
      color,
      cost,
      customFields,
      value: carryCount
    })) ?? [];
  const customFieldsData = Object.entries(
    (carryItems ?? []).reduce<
      Record<string, { total: number; carryCount: number; cost?: number }>
    >((acc, item) => {
      item.customFields
        ?.filter((c) => c.name === selectedTagField)
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

  const isViewingItems = viewMode === 'items';
  const isViewingItemsOverTime = viewMode === 'items-over-time';
  const isGroupingByItems = selectedTagField === null;
  const chartData = isGroupingByItems ? itemData : customFieldsData;
  const sortedSeriesData = chartData.toSorted(
    ({ value: a }, { value: b }) => b - a
  );
  const topSeriesIds = sortedSeriesData.slice(0, 5).map(({ id }) => id);
  const seriesIds = chartData.map(({ id }) => id);
  const visibleSeriesIdSet = new Set(seriesIds);
  const effectiveSelectedSeriesIds =
    selectedSeriesIds === null
      ? seriesIds
      : selectedSeriesIds.filter((id) => visibleSeriesIdSet.has(id));

  const toggleSelectedSeries = (seriesId: string) =>
    setSelectedSeriesIds((current) => {
      const base = current ?? seriesIds;

      return base.includes(seriesId)
        ? base.filter((id) => id !== seriesId)
        : [...base, seriesId];
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
            onChange={() => setViewMode('items')}
            variant="light"
          >
            Items
          </Chip>
          <Chip
            size="xs"
            checked={isViewingItemsOverTime}
            onChange={() => setViewMode('items-over-time')}
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
              checked={selectedTagField === name}
              onChange={(checked) => setSelectedTagField(checked ? name : null)}
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
            selectedSeriesIds={effectiveSelectedSeriesIds}
            selectedTagField={selectedTagField}
            controlsRightSection={
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<TbAdjustmentsHorizontal size={14} />}
                onClick={openSeriesPicker}
              >
                Series ({effectiveSelectedSeriesIds.length})
              </Button>
            }
          />
        ) : (
          <PieChart data={chartData} />
        )}
      </Box>

      {isGroupingByItems ? (
        <CarryItemStatsTable data={itemData} />
      ) : (
        <CustomFieldStatsTable data={customFieldsData} />
      )}

      <SeriesPickerDrawer
        opened={seriesPickerOpened}
        onClose={closeSeriesPicker}
        onShowAll={() => setSelectedSeriesIds(null)}
        onShowTopFive={() => setSelectedSeriesIds(topSeriesIds)}
        onClearSelection={() => setSelectedSeriesIds([])}
        items={sortedSeriesData}
        selectedItemIds={effectiveSelectedSeriesIds}
        onToggleItem={toggleSelectedSeries}
      />
    </ResponsiveScrollArea>
  );
};
