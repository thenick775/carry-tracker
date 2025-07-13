import {
  Grid,
  Card,
  Group,
  ActionIcon,
  Button,
  Text,
  Image,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'preact/hooks';
import { TbX, TbPlus } from 'react-icons/tb';

import { CarryItemModal } from './carry-item-modal.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useObjectUrl } from '../hooks/use-object-url.ts';

import type { CarryItem } from '../hooks/use-carry-items.ts';

type ItemCardProps = {
  item: CarryItem;
  onDelete: () => void;
  onRequestEdit: () => void;
  onIncreaseCount: () => void;
};

const ItemCard = ({
  item,
  onDelete,
  onRequestEdit,
  onIncreaseCount,
}: ItemCardProps) => {
  const imageUrl = useObjectUrl(item.imageData);

  return (
    <Card shadow="md" padding="lg" radius="md" withBorder>
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
        Carry Count: {item.carryCount}
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
};

export const ItemsView = () => {
  const { carryItems, createCarryItem, updateCarryItem, deleteCarryItem } =
    useCarryItems();
  const [editCarryItem, setEditCarryItem] = useState<CarryItem>();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setEditCarryItem(undefined),
  });

  const increaseCarryItemCount = (carryItem: CarryItem) =>
    updateCarryItem(carryItem?.id, { carryCount: carryItem.carryCount + 1 });

  return (
    <>
      <Text mb="sm">Carry Items:</Text>
      <Grid gutter="lg" pt="sm">
        <AnimatePresence mode="popLayout" initial={false}>
          {carryItems?.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
              <motion.div
                layout
                initial={{ opacity: 0, y: -50, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -50, height: 0 }}
                transition={{
                  duration: 0.5,
                  type: 'spring',
                  bounce: 0.3,
                  ease: 'easeOut',
                }}
                style={{ overflow: 'hidden' }}
              >
                <ItemCard
                  item={item}
                  onDelete={() => deleteCarryItem(item.id)}
                  onRequestEdit={() => {
                    setEditCarryItem(item);
                    open();
                  }}
                  onIncreaseCount={() => increaseCarryItemCount(item)}
                />
              </motion.div>
            </Grid.Col>
          ))}
        </AnimatePresence>
      </Grid>

      <ActionIcon
        aria-label="Add item"
        variant="filled"
        pos="absolute"
        size="xl"
        style={{
          bottom: 24,
          right: 8,
        }}
        onClick={open}
      >
        <TbPlus size={25} />
      </ActionIcon>

      <CarryItemModal
        carryItem={editCarryItem}
        opened={opened}
        close={close}
        onSubmit={(carryItem) =>
          editCarryItem
            ? updateCarryItem(editCarryItem.id, carryItem)
            : createCarryItem(carryItem)
        }
      />
    </>
  );
};
