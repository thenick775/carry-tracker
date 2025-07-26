import {
  Card,
  Group,
  ActionIcon,
  Button,
  Text,
  Image,
  Badge
} from '@mantine/core';
import dayjs from 'dayjs';
import { TbX } from 'react-icons/tb';

import type { CarryItem } from '../../hooks/use-carry-items.ts';

type ItemCardProps = {
  item: CarryItem;
  onDelete: () => void;
  onRequestEdit: () => void;
  onIncreaseCount: () => void;
  imageUrl: string;
};

export const CarryItemCard = ({
  item,
  onDelete,
  onRequestEdit,
  onIncreaseCount,
  imageUrl
}: ItemCardProps) => (
  <Card shadow="md" padding="lg" radius="md" withBorder mb="md">
    <Group justify="space-between" mb="xs">
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

    <Image radius="md" src={imageUrl} mb="xs" w="auto" fit="contain" />

    <Text size="sm" c="dimmed">
      Added: {dayjs(item.createdAt).format('MMM D, YYYY')}
    </Text>

    <Text size="sm" c="dimmed">
      Carry Count: {item.carryCount.toLocaleString('en-US')}
    </Text>

    <Group gap="xs">
      <Text size="sm" c="dimmed">
        Color:
      </Text>
      <Badge size="xs" circle color={item.color}></Badge>
    </Group>

    <Button mt="md" fullWidth variant="light" onClick={onRequestEdit}>
      Edit
    </Button>
    <Button mt="md" fullWidth variant="light" onClick={onIncreaseCount}>
      Increase Count
    </Button>
  </Card>
);
