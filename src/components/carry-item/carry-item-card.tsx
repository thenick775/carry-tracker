import {
  Card,
  Group,
  ActionIcon,
  Button,
  Text,
  Image,
  Badge,
  Flex
} from '@mantine/core';
import dayjs from 'dayjs';
import { TbX } from 'react-icons/tb';

import type { CarryItem } from '../../hooks/use-carry-items.ts';

type ItemCardProps = {
  item: CarryItem;
  onDelete: () => void;
  onRequestEdit: () => void;
  onRequestHistory: () => void;
  onIncreaseCount: () => void;
  imageUrl: string;
};

export const CarryItemCard = ({
  item,
  onDelete,
  onRequestEdit,
  onRequestHistory,
  onIncreaseCount,
  imageUrl
}: ItemCardProps) => (
  <Card shadow="md" padding="lg" radius="md" withBorder mb="md">
    <Group justify="space-between" mb="xs" style={{ flexWrap: 'nowrap' }}>
      <Text fw={500}>{item.name}</Text>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="red"
        aria-label="Delete tracker"
        onClick={onDelete}
      >
        <TbX size={18} />
      </ActionIcon>
    </Group>

    <Image
      alt={`${item.name}`}
      radius="md"
      src={imageUrl}
      mb="xs"
      w="auto"
      fit="contain"
    />

    <Text size="sm" c="var(--app-color-card-muted)">
      Added: {dayjs(item.createdAt).format('MMM D, YYYY')}
    </Text>

    <Text size="sm" c="var(--app-color-card-muted)">
      Carry Count: {item.carryCount.toLocaleString('en-US')}
    </Text>

    <Group gap="xs">
      <Text size="sm" c="var(--app-color-card-muted)">
        Color:
      </Text>
      <Badge size="xs" circle color={item.color} />
    </Group>

    <Flex gap="xs" mt="md">
      <Button fullWidth variant="light" onClick={onRequestEdit}>
        Edit
      </Button>
      <Button fullWidth variant="light" onClick={onRequestHistory}>
        History
      </Button>
    </Flex>
    <Button mt="md" fullWidth variant="light" onClick={onIncreaseCount}>
      Increase Count
    </Button>
  </Card>
);
