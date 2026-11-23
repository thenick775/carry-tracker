import {
  Box,
  Card,
  Chip,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { motion } from 'motion/react';
import randomColor from 'randomcolor';
import { useState } from 'react';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { PieChart } from './most-carried/pie-chart.tsx';
import { useCarryItems, type CarryItem } from '../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

type ValueGroup = {
  id: string;
  name: string;
  costCents: number;
  itemCount: number;
  color: string;
};

const formatCurrency = (value: number) => currencyFormatter.format(value);
const toCents = (value: number) => Math.round(value * 100);
const fromCents = (value: number) => value / 100;

const MetricCard = ({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) => (
  <Card withBorder radius="md" padding="md">
    <Text size="xs" tt="uppercase" fw={700} c="dimmed">
      {label}
    </Text>
    <Text
      fw={700}
      fz="xl"
      mt={4}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </Text>
    {detail && (
      <Text size="xs" c="dimmed" mt={2}>
        {detail}
      </Text>
    )}
  </Card>
);

export const CostBreakdownView = () => {
  const { carryItems: liveCarryItems } = useCarryItems();
  const carryItems: CarryItem[] | undefined = liveCarryItems;
  const isLargerThanPhone = useIsLargerThanPhone();
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const isLoading = carryItems === undefined;
  const items = carryItems ?? [];
  const costedItems = items.filter((item) => item.cost !== undefined);
  const totalCostCents = costedItems.reduce(
    (total, item) => total + toCents(item.cost!),
    0
  );
  const totalValue = fromCents(totalCostCents);
  const customFieldNames = Array.from(
    new Set(
      items.flatMap((item) => item.customFields?.map(({ name }) => name) ?? [])
    )
  ).toSorted();

  const groups = selectedField
    ? Object.values(
        costedItems.reduce<Record<string, ValueGroup>>((result, item) => {
          const values = new Set(
            item.customFields
              ?.filter(({ name }) => name === selectedField)
              .map(({ value }) => value) ?? []
          );

          for (const value of values) {
            const previous = result[value] ?? {
              id: value,
              name: value,
              costCents: 0,
              itemCount: 0,
              color: randomColor({ seed: `${selectedField}::${value}` })
            };
            result[value] = {
              ...previous,
              costCents: previous.costCents + toCents(item.cost!),
              itemCount: previous.itemCount + 1
            };
          }

          return result;
        }, {})
      )
    : costedItems.map((item) => ({
        id: item.id,
        name: item.name,
        costCents: toCents(item.cost!),
        itemCount: 1,
        color: item.color
      }));
  const sortedGroups = groups.toSorted((a, b) => b.costCents - a.costCents);

  const largestAllocation = sortedGroups.at(0);

  const topThreeCostCents = sortedGroups
    .slice(0, 3)
    .reduce((total, group) => total + group.costCents, 0);
  const topThreePercentage = totalCostCents
    ? (topThreeCostCents / totalCostCents) * 100
    : 0;

  const hasMultipleValuesForSelectedField =
    selectedField !== null &&
    items.some(
      (item) =>
        new Set(
          item.customFields
            ?.filter(({ name }) => name === selectedField)
            .map(({ value }) => value) ?? []
        ).size > 1
    );

  return (
    <ResponsiveScrollArea>
      <Stack gap="lg" pb="xl">
        <Box>
          <Title order={3}>Cost Breakdown</Title>
        </Box>

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Stack gap="lg">
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                <MetricCard
                  label="Total Cost"
                  value={formatCurrency(totalValue)}
                />
                <MetricCard
                  label="Highest Cost"
                  value={
                    largestAllocation
                      ? formatCurrency(fromCents(largestAllocation.costCents))
                      : '—'
                  }
                  detail={largestAllocation?.name ?? 'No recorded costs'}
                />
                <MetricCard
                  label="Top 3 Share"
                  value={totalValue ? `${topThreePercentage.toFixed(0)}%` : '—'}
                  detail="Of recorded purchase cost"
                />
                <MetricCard
                  label="Cost coverage"
                  value={`${costedItems.length} of ${items.length}`}
                  detail={`${items.length - costedItems.length} missing cost`}
                />
              </SimpleGrid>

              <Card withBorder radius="md" padding="md">
                <Stack gap="sm">
                  <Box>
                    <Text fw={600}>Purchase Cost Distribution</Text>
                    <Text size="sm" c="dimmed">
                      {selectedField
                        ? `Recorded purchase cost by ${selectedField}`
                        : 'Recorded purchase cost by item'}
                    </Text>
                  </Box>
                  <Group gap="xs" wrap="wrap">
                    <Chip
                      size="xs"
                      checked={selectedField === null}
                      onChange={() => setSelectedField(null)}
                      variant="light"
                    >
                      Items
                    </Chip>
                    {customFieldNames.map((name) => (
                      <Chip
                        key={name}
                        size="xs"
                        checked={selectedField === name}
                        onChange={(checked) =>
                          setSelectedField(checked ? name : null)
                        }
                        variant="light"
                      >
                        {name}
                      </Chip>
                    ))}
                  </Group>
                  {hasMultipleValuesForSelectedField && (
                    <Text size="xs" c="dimmed">
                      Items with multiple {selectedField} values are included in
                      each matching group.
                    </Text>
                  )}
                  <Box h={isLargerThanPhone ? 360 : 300}>
                    <PieChart
                      data={sortedGroups.map((group) => ({
                        name: group.name,
                        value: fromCents(group.costCents),
                        color: group.color
                      }))}
                      valueFormatter={formatCurrency}
                    />
                  </Box>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="md">
                <Stack gap="sm">
                  <Box>
                    <Text fw={600}>Purchase Cost Allocation</Text>
                    <Text size="sm" c="dimmed">
                      {selectedField
                        ? `Ranked by recorded purchase cost for ${selectedField}`
                        : 'Ranked by recorded purchase cost'}
                    </Text>
                  </Box>
                  <Stack gap="xs">
                    {sortedGroups.map((group) => {
                      const percentage = totalCostCents
                        ? (group.costCents / totalCostCents) * 100
                        : 0;

                      return (
                        <Card
                          key={group.id}
                          withBorder
                          padding="sm"
                          radius="sm"
                        >
                          <Group justify="space-between" wrap="nowrap" gap="sm">
                            <Text fw={600} style={{ flex: 1, minWidth: 0 }}>
                              {group.name}
                            </Text>
                            <Text
                              fw={700}
                              style={{
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatCurrency(fromCents(group.costCents))} ·{' '}
                              {percentage.toFixed(0)}%
                            </Text>
                          </Group>
                          <Progress
                            mt="xs"
                            value={percentage}
                            color={group.color}
                            size="lg"
                            radius="xl"
                            aria-label={`${group.name}: ${percentage.toFixed(0)}% of recorded purchase cost`}
                          />
                          <Text size="xs" c="dimmed" mt="sm">
                            {group.itemCount}{' '}
                            {group.itemCount === 1 ? 'item' : 'items'}
                          </Text>
                        </Card>
                      );
                    })}
                    {sortedGroups.length === 0 && (
                      <Text ta="center" c="dimmed" py="md">
                        Add costs to items to see how your purchase cost is
                        allocated.
                      </Text>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </motion.div>
        )}
      </Stack>
    </ResponsiveScrollArea>
  );
};
