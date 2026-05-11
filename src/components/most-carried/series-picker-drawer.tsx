import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput
} from '@mantine/core';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { TbX } from 'react-icons/tb';

type SeriesPickerItem = {
  id: string;
  name: string;
  color: string;
};

type SeriesPickerDrawerProps = {
  opened: boolean;
  onClose: () => void;
  onShowAll: () => void;
  onShowTopFive: () => void;
  onClearSelection: () => void;
  items: SeriesPickerItem[];
  selectedItemIds: string[];
  onToggleItem: (itemId: string) => void;
};

export const SeriesPickerDrawer = ({
  opened,
  onClose,
  onShowAll,
  onShowTopFive,
  onClearSelection,
  items,
  selectedItemIds,
  onToggleItem
}: SeriesPickerDrawerProps) => {
  const [seriesSearch, setSeriesSearch] = useState('');

  const filteredSeriesOptions = items.filter(({ name }) =>
    name.toLowerCase().includes(seriesSearch.trim().toLowerCase())
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Choose plotted series"
      position="bottom"
      size="45%"
      radius="md"
    >
      <Stack gap="md" h="100%">
        <TextInput
          size="md"
          placeholder="Search items"
          value={seriesSearch}
          onChange={(event) => setSeriesSearch(event.currentTarget.value)}
          rightSection={
            <AnimatePresence>
              {seriesSearch && (
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
                    onClick={() => setSeriesSearch('')}
                    aria-label="Clear search"
                  >
                    <TbX size={16} />
                  </ActionIcon>
                </motion.div>
              )}
            </AnimatePresence>
          }
        />

        <Group grow>
          <Button variant="default" onClick={onShowAll}>
            Show all
          </Button>
          <Button variant="default" onClick={onClearSelection}>
            Hide all
          </Button>
        </Group>

        <Button variant="light" onClick={onShowTopFive}>
          Show top 5
        </Button>

        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="xs">
            {filteredSeriesOptions.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);

              return (
                <Button
                  key={item.id}
                  variant={isSelected ? 'light' : 'subtle'}
                  color={isSelected ? 'blue' : 'gray'}
                  justify="space-between"
                  onClick={() => onToggleItem(item.id)}
                  styles={{
                    inner: { justifyContent: 'space-between', width: '100%' },
                    label: {
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }
                  }}
                >
                  <Group gap="xs">
                    <Badge size="xs" circle color={item.color} />
                    <Text truncate="end" flex={1}>
                      {item.name}
                    </Text>
                  </Group>
                  <Text size="sm" c={isSelected ? 'blue.3' : 'dimmed'}>
                    {isSelected ? 'On' : 'Off'}
                  </Text>
                </Button>
              );
            })}
          </Stack>
        </ScrollArea>
      </Stack>
    </Drawer>
  );
};
