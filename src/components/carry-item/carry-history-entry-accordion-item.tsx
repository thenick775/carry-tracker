import { Accordion, Button, Group, NumberInput, Stack, Text } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { TbTrash } from 'react-icons/tb';

import type { CarryHistoryDraftEntry } from '../../hooks/use-carries-over-time.ts';

type CarryHistoryEntryAccordionItemProps = {
  entry: CarryHistoryDraftEntry;
  delta?: number;
  error: {
    date?: string;
    count?: string;
  };
  onUpdate: (updates: Partial<CarryHistoryDraftEntry>) => void;
  onDelete: () => void;
};

const formatRecordedAt = (value?: string) =>
  value ? dayjs(value).format('MMM DD, YYYY') : 'Not recorded';

export const CarryHistoryEntryAccordionItem = ({
  entry,
  delta,
  error,
  onUpdate,
  onDelete
}: CarryHistoryEntryAccordionItemProps) => (
  <Accordion.Item value={entry.id}>
    <Accordion.Control>
      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={500} truncate>
            {formatRecordedAt(entry.createdAt)}
          </Text>
        </Stack>
        <Group gap="xs" wrap="nowrap">
          <Text>Count: {entry.currentCarryCount}</Text>
        </Group>
      </Group>
    </Accordion.Control>
    <Accordion.Panel>
      <Stack gap="sm">
        <DateTimePicker
          withSeconds
          label="Recorded at"
          valueFormat="MMM DD YYYY hh:mm:ss A"
          dropdownType="modal"
          value={entry.createdAt}
          onChange={(value) => onUpdate({ createdAt: value ?? '' })}
          error={error.date}
        />
        <NumberInput
          label="Carry count"
          min={0}
          allowNegative={false}
          allowDecimal={false}
          clampBehavior="strict"
          thousandSeparator="," 
          value={entry.currentCarryCount}
          error={error.count}
          onChange={(value) =>
            onUpdate({
              currentCarryCount: typeof value === 'number' ? value : 0
            })
          }
        />
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {delta !== undefined
              ? `${delta > 0 ? `+${delta}` : delta} from previous`
              : 'Starting entry'}
          </Text>
          <Button
            variant="subtle"
            color="red"
            leftSection={<TbTrash size={16} />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Accordion.Panel>
  </Accordion.Item>
);
