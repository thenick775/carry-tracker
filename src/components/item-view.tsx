import { ActionIcon, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'preact/hooks';
import { TbPlus } from 'react-icons/tb';

import { CarryItemModal } from './carry-item-modal.tsx';
import { ItemCard } from './item-card.tsx';
import { Masonry } from './masonry.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';

import type { CarryItem } from '../hooks/use-carry-items.ts';

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
      <Masonry>
        {carryItems?.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onDelete={() => deleteCarryItem(item.id)}
            onRequestEdit={() => {
              setEditCarryItem(item);
              open();
            }}
            onIncreaseCount={() => increaseCarryItemCount(item)}
          />
        ))}
      </Masonry>

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
