import { Box, Text } from '@mantine/core';

import { PieChart } from './pie-chart.tsx';
import { StatsTable } from './stats-table.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';

const hashStringToInt = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const idToBaseHSL = (id: string) => {
  const hash = hashStringToInt(id);
  const hue = hash % 360;
  const saturation = 70;
  const lightness = 55;
  return { hue, saturation, lightness };
};

const adjustLightness = (lightness: number, index: number) =>
  lightness + (index % 2 === 0 ? 5 : -5);

const hslToCss = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;

const reorderForMaxHueDifference = <T extends { id: string; baseHue: number }>(
  items?: T[]
): T[] | null => {
  if (!items) return null;

  const sorted = [...items].sort((a, b) => a.baseHue - b.baseHue);
  const reordered: T[] = [];
  let left = 0;
  let right = sorted.length - 1;
  while (left <= right) {
    reordered.push(sorted[left++]);
    if (left <= right) {
      reordered.push(sorted[right--]);
    }
  }
  return reordered;
};

export const MostCarriedView = () => {
  const { carryItems } = useCarryItems();

  const itemsWithHue = carryItems?.map((item) => ({
    ...item,
    baseHue: hashStringToInt(item.id) % 360,
  }));

  const reorderedItems = reorderForMaxHueDifference(itemsWithHue);

  const chartData = reorderedItems?.map(({ id, name, carryCount }, index) => {
    const { hue, saturation, lightness } = idToBaseHSL(id);
    const adjustedLightness = adjustLightness(lightness, index);
    const color = hslToCss(hue, saturation, adjustedLightness);
    return {
      id,
      name,
      color,
      value: carryCount,
    };
  });

  return (
    <>
      <Text mb="sm">Most Carried:</Text>
      <Box
        w="100%"
        h="100%"
        style={{
          aspectRatio: '1 / 1',
          maxWidth: '100%',
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
