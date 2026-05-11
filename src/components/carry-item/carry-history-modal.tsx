import {
  Accordion,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text
} from '@mantine/core';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { TbPlus } from 'react-icons/tb';

import { CarryHistoryChart } from './carry-history-chart.tsx';
import { CarryHistoryEntryAccordionItem } from './carry-history-entry-accordion-item.tsx';
import {
  useCarryHistory,
  type CarryHistoryDraftEntry
} from '../../hooks/use-carries-over-time.ts';
import { useIsLargerThanPhone } from '../../hooks/use-is-larger-than-phone.ts';

type CarryHistoryEditorModalProps = {
  carryItem: {
    id: string;
    name: string;
    carryCount: number;
    color: string;
  };
  opened: boolean;
  close: () => void;
};

export const CarryHistoryModal = ({
  carryItem,
  opened,
  close
}: CarryHistoryEditorModalProps) => {
  const isLargerThanPhone = useIsLargerThanPhone();
  const { carryHistory, saveCarryHistory } = useCarryHistory(carryItem.id);
  const [draftEntries, setDraftEntries] = useState<
    CarryHistoryDraftEntry[] | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);

  const sourceEntries =
    carryHistory?.map(({ id, createdAt, currentCarryCount }) => ({
      id,
      createdAt,
      currentCarryCount
    })) ?? [];
  const effectiveDraftEntries = draftEntries ?? sourceEntries;

  const validationErrors = useMemo(() => {
    const duplicateCounts = new Map<string, number>();

    for (const entry of effectiveDraftEntries) {
      const normalized = dayjs(entry.createdAt).isValid()
        ? dayjs(entry.createdAt).toISOString()
        : entry.createdAt;
      duplicateCounts.set(
        normalized,
        (duplicateCounts.get(normalized) ?? 0) + 1
      );
    }

    return effectiveDraftEntries.reduce<
      Record<string, { date?: string; count?: string }>
    >((acc, entry) => {
      if (!dayjs(entry.createdAt).isValid()) {
        acc[entry.id] = { date: 'Enter a valid recorded time.' };
        return acc;
      }

      if (
        !Number.isInteger(entry.currentCarryCount) ||
        entry.currentCarryCount < 0
      ) {
        acc[entry.id] = { count: 'Carry count must be 0 or greater.' };
        return acc;
      }

      if (duplicateCounts.get(dayjs(entry.createdAt).toISOString())! > 1) {
        acc[entry.id] = { date: 'Each entry needs a unique recorded time.' };
      }

      return acc;
    }, {});
  }, [effectiveDraftEntries]);

  const hasErrors = Object.values(validationErrors).some(
    (error) => (error.date ?? error.count) !== undefined
  );
  const sortedDraftEntries = effectiveDraftEntries.toSorted(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
  );
  const latestDraftEntry = sortedDraftEntries.at(-1);
  const draftEntryCount = sortedDraftEntries.length;

  const updateDraftEntry = (
    id: string,
    updates: Partial<CarryHistoryDraftEntry>
  ) =>
    setDraftEntries((current) =>
      (current ?? sourceEntries).map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );

  const addEntry = () => {
    const baseCount = sortedDraftEntries.at(-1)?.currentCarryCount ?? 0;

    setDraftEntries((current) => [
      ...(current ?? sourceEntries),
      {
        id: crypto.randomUUID(),
        createdAt: dayjs().toISOString(),
        currentCarryCount: baseCount
      }
    ]);
  };

  const handleSave = async () => {
    if (hasErrors) {
      return;
    }

    setIsSaving(true);

    await saveCarryHistory(sortedDraftEntries);

    setIsSaving(false);
    close();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Edit Carry History"
      size="lg"
      fullScreen={!isLargerThanPhone}
    >
      <Stack gap="md">
        <Group justify="space-between" align="start" gap="sm">
          <Stack gap={2}>
            <Text fw={600}>{carryItem.name}</Text>
            <Text size="sm" c="dimmed">
              {draftEntryCount} entr{draftEntryCount === 1 ? 'y' : 'ies'}
            </Text>
          </Stack>
          <Text fw={600}>
            Current count:{' '}
            {latestDraftEntry?.currentCarryCount ?? carryItem.carryCount}
          </Text>
        </Group>
        <Group gap="xs">
          <Button leftSection={<TbPlus size={16} />} onClick={addEntry}>
            Add Entry
          </Button>
        </Group>
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <Text fw={600}>Trend</Text>
            <CarryHistoryChart
              entries={sortedDraftEntries}
              color={carryItem.color}
            />
          </Stack>
        </Paper>
        <Accordion variant="separated" chevronPosition="right">
          {sortedDraftEntries.map((entry, index) => {
            const previousEntry = sortedDraftEntries[index - 1];
            const delta =
              index === 0
                ? undefined
                : entry.currentCarryCount - previousEntry.currentCarryCount;
            const error = validationErrors[entry.id] ?? {};

            return (
              <CarryHistoryEntryAccordionItem
                key={entry.id}
                entry={entry}
                delta={delta}
                error={error}
                onUpdate={(updates) => updateDraftEntry(entry.id, updates)}
                onDelete={() =>
                  setDraftEntries((current) =>
                    (current ?? sourceEntries).filter(
                      (currentEntry) => currentEntry.id !== entry.id
                    )
                  )
                }
              />
            );
          })}
        </Accordion>
        <Group justify="flex-end">
          <Button variant="default" onClick={close} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isSaving} disabled={hasErrors}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
