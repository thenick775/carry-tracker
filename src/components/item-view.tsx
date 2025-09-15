import { ActionIcon, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'preact/hooks';
import { TbPlus } from 'react-icons/tb';

import { CarryItemCard } from './carry-item/carry-item-card.tsx';
import { CarryItemModal } from './carry-item/carry-item-modal.tsx';
import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { Masonry } from './masonry/masonry.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useObjectUrls } from '../hooks/use-object-urls.ts';
import { NoItems } from './carry-item/no-items.tsx';

import type { CarryItem } from '../hooks/use-carry-items.ts';

export const ItemsView = () => {
  const [nameFilter, setNameFilter] = useState<string>();
  const { carryItems, createCarryItem, updateCarryItem, deleteCarryItem } =
    useCarryItems(nameFilter);
  const [editCarryItem, setEditCarryItem] = useState<CarryItem>();
  const images = useMemo(
    () =>
      carryItems?.map((carryItem) => carryItem.imageData).filter((c) => !!c),
    [carryItems]
  );
  const imageUrls = useObjectUrls(images);
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setEditCarryItem(undefined)
  });

  const increaseCarryItemCount = (carryItem: CarryItem) =>
    updateCarryItem(carryItem.id, { carryCount: carryItem.carryCount + 1 });

  const isLoading = carryItems === undefined;
  const shouldRenderMasonry = !isLoading && carryItems.length > 0;
  const hasNoItems = !isLoading && carryItems?.length === 0;

  return (
    <>
      <ResponsiveScrollArea>
        <AnimatePresence>
          <TextInput
            placeholder="Search by name"
            size="md"
            mb="sm"
            onChange={(event) => setNameFilter(event.currentTarget.value)}
          />
          {hasNoItems && <NoItems />}
          {shouldRenderMasonry && (
            <motion.div
              key="items"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Text mb="sm">Carry Items:</Text>
              <Masonry>
                {imageUrls &&
                  carryItems.map((item, idx) => (
                    <CarryItemCard
                      key={item.id}
                      item={item}
                      imageUrl={imageUrls?.[idx]}
                      onDelete={() => deleteCarryItem(item.id)}
                      onRequestEdit={() => {
                        setEditCarryItem(item);
                        open();
                      }}
                      onIncreaseCount={() => increaseCarryItemCount(item)}
                    />
                  ))}
              </Masonry>
            </motion.div>
          )}
        </AnimatePresence>

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
      </ResponsiveScrollArea>

      <ActionIcon
        aria-label="Add item"
        variant="filled"
        pos="absolute"
        size="xl"
        style={{
          bottom: 24,
          right: 16
        }}
        onClick={open}
      >
        <TbPlus size={25} />
      </ActionIcon>
    </>
  );
};
