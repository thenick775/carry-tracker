import {
  Grid,
  Card,
  Group,
  ActionIcon,
  Button,
  Text,
  Image,
} from '@mantine/core';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'motion/react';
import { nanoid } from 'nanoid';
import { TbX, TbPlus } from 'react-icons/tb';

import { useCarryItems, type CarryItem } from '../hooks/use-carry-items.ts';

export const ItemsView = () => {
  const [carryItems, setCarryItems] = useCarryItems();

  const addCarryItem = (item: CarryItem) =>
    setCarryItems((prev) => [item, ...prev]);

  const deleteCarryItem = (id: string) =>
    setCarryItems((prev) => prev.filter((item) => item.id !== id));

  const increaseCarryItemCount = (id: string) =>
    setCarryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, carryCount: item.carryCount + 1 } : item
      )
    );

  return (
    <>
      <Text mb="sm">Carry Items:</Text>
      <Grid gutter="lg" pt="sm">
        <AnimatePresence mode="popLayout" initial={false}>
          {carryItems.map((item) => (
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
                <Card shadow="md" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{item.name}</Text>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      aria-label="Delete tracker"
                      onClick={() => deleteCarryItem(item.id)}
                    >
                      <TbX size={18} />
                    </ActionIcon>
                  </Group>

                  <Image
                    radius="md"
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png"
                    mb="xs"
                  />

                  <Text size="sm" c="dimmed">
                    Added: {dayjs(item.createdAt).format('MMM D, YYYY')}
                  </Text>

                  <Text size="sm" c="dimmed">
                    Carry Count: {item.carryCount}
                  </Text>

                  <Button mt="md" fullWidth variant="light">
                    Edit
                  </Button>
                  <Button
                    mt="md"
                    fullWidth
                    variant="light"
                    onClick={() => increaseCarryItemCount(item.id)}
                  >
                    Increase Count
                  </Button>
                </Card>
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
        onClick={() =>
          addCarryItem({
            id: nanoid(),
            name: 'some name',
            createdAt: dayjs().toISOString(),
            carryCount: 0,
          })
        }
      >
        <TbPlus size={25} />
      </ActionIcon>
    </>
  );
};
