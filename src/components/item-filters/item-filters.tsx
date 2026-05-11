import {
  Accordion,
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Flex,
  Group,
  RangeSlider,
  Stack,
  Text,
  TextInput
} from '@mantine/core';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { TbX } from 'react-icons/tb';

import type { CarryItemFilterOptions } from '../../hooks/use-carry-item-filter-options.ts';
import type {
  CarryItemFilters,
  FilterRange
} from '../../hooks/use-carry-items.ts';

type ItemFiltersProps = {
  closeFilters: () => void;
  filterOptions?: CarryItemFilterOptions;
  filteredItemCount: number;
  filters: CarryItemFilters;
  openedFilters: boolean;
  openFilters: () => void;
  setFilters: Dispatch<SetStateAction<CarryItemFilters>>;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const isActiveRange = (
  bounds: FilterRange | undefined,
  value: FilterRange | undefined
) => !!bounds && !!value && (value[0] !== bounds[0] || value[1] !== bounds[1]);

const getDateSliderRange = (
  dateRange: FilterRange | undefined
): FilterRange | undefined =>
  dateRange
    ? [0, dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day')]
    : undefined;

const getDateSliderValue = (
  dateRange: FilterRange | undefined,
  value: FilterRange | undefined
): FilterRange | undefined =>
  dateRange && value
    ? [
        dayjs(value[0]).diff(dayjs(dateRange[0]), 'day'),
        dayjs(value[1]).diff(dayjs(dateRange[0]), 'day')
      ]
    : undefined;

const formatDate = (value: number) => dayjs(value).format('MMM D, YYYY');

const formatDateRange = (value: FilterRange | undefined) => {
  if (!value) {
    return 'No dates available';
  }

  return `${formatDate(value[0])} - ${formatDate(value[1])}`;
};

const formatCountRange = (value: FilterRange | undefined) => {
  if (!value) {
    return 'No counts available';
  }

  return `${value[0].toLocaleString('en-US')} - ${value[1].toLocaleString('en-US')}`;
};

const formatCostRange = (value: FilterRange | undefined) => {
  if (!value) {
    return 'No costs available';
  }

  return `${currencyFormatter.format(value[0])} - ${currencyFormatter.format(value[1])}`;
};

const FilterSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Stack gap="sm">
    <Text fw={600}>{title}</Text>
    {children}
  </Stack>
);

export const ItemFilters = ({
  closeFilters,
  filterOptions,
  filteredItemCount,
  filters,
  openedFilters,
  openFilters,
  setFilters
}: ItemFiltersProps) => {
  const dateRange = filterOptions?.createdAtRange;
  const dateSliderRange = getDateSliderRange(dateRange);
  const carryCountRange = filterOptions?.carryCountRange;
  const costRange = filterOptions?.costRange;
  const customFieldOptions = filterOptions?.customFieldOptions ?? {};

  const createdAtRangeValue = filters.createdAt ?? dateRange;
  const createdAtSliderValue = getDateSliderValue(
    dateRange,
    createdAtRangeValue
  );
  const carryCountRangeValue = filters.carryCount ?? carryCountRange;
  const costRangeValue = filters.cost ?? costRange;

  const [localCreatedAtSlider, setLocalCreatedAtSlider] = useState<
    FilterRange | undefined
  >(createdAtSliderValue);
  const [localCarryCountSlider, setLocalCarryCountSlider] = useState<
    FilterRange | undefined
  >(carryCountRangeValue);
  const [localCostSlider, setLocalCostSlider] = useState<
    FilterRange | undefined
  >(costRangeValue);

  const displayedCreatedAtSlider = localCreatedAtSlider ?? createdAtSliderValue;
  const displayedCarryCountSlider =
    localCarryCountSlider ?? carryCountRangeValue;
  const displayedCostSlider = localCostSlider ?? costRangeValue;

  const setSearchFilter = (search: string) =>
    setFilters((current) => ({
      ...current,
      search
    }));

  const sliderFilterToDateRange = (value?: FilterRange) => {
    if (!dateRange || !dateSliderRange || !value) {
      return;
    }

    return [
      dayjs(dateRange[0]).add(value[0], 'day').startOf('day').valueOf(),
      dayjs(dateRange[0]).add(value[1], 'day').startOf('day').valueOf()
    ] satisfies FilterRange;
  };

  const setCreatedAtFilter = (value: FilterRange) => {
    const nextValue = sliderFilterToDateRange(value);
    if (!dateSliderRange || !nextValue) {
      return;
    }

    setFilters((current) => ({
      ...current,
      createdAt:
        value[0] === dateSliderRange[0] && value[1] === dateSliderRange[1]
          ? undefined
          : nextValue
    }));
  };

  const setCarryCountFilter = (value: FilterRange) => {
    if (!carryCountRange) {
      return;
    }

    setFilters((current) => ({
      ...current,
      carryCount:
        value[0] === carryCountRange[0] && value[1] === carryCountRange[1]
          ? undefined
          : value
    }));
  };

  const setCostFilter = (value: FilterRange) => {
    if (!costRange) {
      return;
    }

    setFilters((current) => ({
      ...current,
      cost:
        value[0] === costRange[0] && value[1] === costRange[1]
          ? undefined
          : value
    }));
  };

  const setCustomFieldFilter = (name: string, values: string[]) =>
    setFilters((current) => {
      const customFields = { ...(current.customFields ?? {}) };

      if (values.length === 0) {
        delete customFields[name];
      } else {
        customFields[name] = values;
      }

      return {
        ...current,
        customFields:
          Object.keys(customFields).length > 0 ? customFields : undefined
      };
    });

  const clearAllFilters = () => setFilters({});

  const activeFilters = [
    {
      active: isActiveRange(dateSliderRange, createdAtSliderValue),
      label: 'Date added',
      onRemove: () =>
        setFilters((current) => ({ ...current, createdAt: undefined }))
    },
    {
      active: isActiveRange(carryCountRange, carryCountRangeValue),
      label: 'Carry count',
      onRemove: () =>
        setFilters((current) => ({ ...current, carryCount: undefined }))
    },
    {
      active: isActiveRange(costRange, costRangeValue),
      label: 'Cost',
      onRemove: () => setFilters((current) => ({ ...current, cost: undefined }))
    }
  ]
    .filter(({ active }) => active)
    .map(({ label, onRemove }) => ({ label, onRemove }))
    .concat(
      Object.entries(filters.customFields ?? {})
        .filter(([, values]) => values.length > 0)
        .map(([name, values]) => ({
          label: `${name}: ${values.length}`,
          onRemove: () => setCustomFieldFilter(name, [])
        }))
    );

  return (
    <>
      <Drawer
        opened={openedFilters}
        onClose={closeFilters}
        title="Filters"
        position="right"
      >
        <Stack gap="md">
          <FilterSection title="Date added">
            <Text c="dimmed">
              {formatDateRange(
                sliderFilterToDateRange(displayedCreatedAtSlider)
              )}
            </Text>
            <RangeSlider
              min={dateSliderRange?.[0]}
              max={dateSliderRange?.[1]}
              step={1}
              minRange={0}
              value={displayedCreatedAtSlider}
              onChange={setLocalCreatedAtSlider}
              onChangeEnd={(filter) => {
                setCreatedAtFilter(filter);
                setLocalCreatedAtSlider(undefined);
              }}
              disabled={
                !dateSliderRange || dateSliderRange[0] === dateSliderRange[1]
              }
              label={null}
            />
          </FilterSection>
          <FilterSection title="Carry count">
            <Text c="dimmed">
              {formatCountRange(displayedCarryCountSlider)}
            </Text>
            <RangeSlider
              min={carryCountRange?.[0]}
              max={carryCountRange?.[1]}
              step={1}
              minRange={0}
              value={displayedCarryCountSlider}
              onChange={setLocalCarryCountSlider}
              onChangeEnd={(filter) => {
                setCarryCountFilter(filter);
                setLocalCarryCountSlider(undefined);
              }}
              disabled={
                !carryCountRange || carryCountRange[0] === carryCountRange[1]
              }
              label={null}
            />
          </FilterSection>
          <FilterSection title="Cost">
            <Text c="dimmed">{formatCostRange(displayedCostSlider)}</Text>
            <RangeSlider
              min={costRange?.[0]}
              max={costRange?.[1]}
              step={0.01}
              minRange={0}
              value={displayedCostSlider}
              onChange={setLocalCostSlider}
              onChangeEnd={(filter) => {
                setCostFilter(filter);
                setLocalCostSlider(undefined);
              }}
              disabled={!costRange || costRange[0] === costRange[1]}
              label={null}
            />
          </FilterSection>
          <FilterSection title="Custom fields">
            {Object.keys(customFieldOptions).length > 0 ? (
              <Accordion multiple variant="separated">
                {Object.entries(customFieldOptions).map(([name, values]) => {
                  const selectedValues = filters.customFields?.[name] ?? [];

                  return (
                    <Accordion.Item key={name} value={name}>
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={500}>{name}</Text>
                          {selectedValues.length > 0 && (
                            <Badge variant="light">
                              {selectedValues.length}
                            </Badge>
                          )}
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Checkbox.Group
                          value={selectedValues}
                          onChange={(nextValues) =>
                            setCustomFieldFilter(name, nextValues)
                          }
                        >
                          <Stack gap="xs">
                            {values.map((value) => (
                              <Checkbox
                                size="md"
                                key={value}
                                value={value}
                                label={value}
                              />
                            ))}
                          </Stack>
                        </Checkbox.Group>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            ) : (
              <Text c="dimmed">No custom fields available yet.</Text>
            )}
          </FilterSection>
          <Divider />
          <Group justify="space-between">
            <Button variant="default" onClick={clearAllFilters}>
              Clear all
            </Button>
            <Button onClick={closeFilters}>
              See {filteredItemCount} result{filteredItemCount === 1 ? '' : 's'}
            </Button>
          </Group>
        </Stack>
      </Drawer>
      <Flex gap="sm" mb="sm" align="flex-start">
        <TextInput
          placeholder="Search by name"
          size="md"
          value={filters.search}
          onChange={(event) => setSearchFilter(event.currentTarget.value)}
          style={{ flex: 1 }}
          rightSection={
            <AnimatePresence>
              {filters.search && (
                <motion.div
                  key="clear"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="md"
                    onClick={() => setSearchFilter('')}
                    aria-label="Clear search"
                  >
                    <TbX size={16} />
                  </ActionIcon>
                </motion.div>
              )}
            </AnimatePresence>
          }
        />
        <Button size="md" variant="default" onClick={openFilters}>
          Filters
        </Button>
      </Flex>
      {activeFilters.length > 0 && (
        <Group gap="xs" mb="md">
          {activeFilters.map((activeFilter) => (
            <Badge
              key={activeFilter.label}
              variant="light"
              component="button"
              type="button"
              onClick={activeFilter.onRemove}
              style={{ cursor: 'pointer' }}
            >
              {activeFilter.label}{' '}
              <TbX size={12} style={{ verticalAlign: 'middle' }} />
            </Badge>
          ))}
        </Group>
      )}
    </>
  );
};
