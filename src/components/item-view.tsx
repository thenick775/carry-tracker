import { ActionIcon, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { TbPlus } from 'react-icons/tb';

import { CarryItemCard } from './carry-item/carry-item-card.tsx';
import { CarryItemModal } from './carry-item/carry-item-modal.tsx';
import { DeleteCarryItemConfirm } from './carry-item/delete-carry-item-confirm.tsx';
import { NoItems } from './carry-item/no-items.tsx';
import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { ItemFilters } from './item-filters/item-filters.tsx';
import { Masonry } from './masonry/masonry.tsx';
import { useCarryItemFilterOptions } from '../hooks/use-carry-item-filter-options.ts';
import {
  useCarryItems,
  type CarryItem,
  type CarryItemFilters
} from '../hooks/use-carry-items.ts';
import { useObjectUrls } from '../hooks/use-object-urls.ts';

export const ItemsView = () => {
  const [filters, setFilters] = useState<CarryItemFilters>({});
  const filterOptions = useCarryItemFilterOptions();
  const { carryItems, createCarryItem, updateCarryItem, deleteCarryItem } =
    useCarryItems(filters);
  const [editCarryItem, setEditCarryItem] = useState<CarryItem>();
  const [deleteCarryItemRequest, setDeleteCarryItemRequest] =
    useState<CarryItem>();
  const images = useMemo(
    () =>
      carryItems?.map((carryItem) => carryItem.imageData).filter((c) => !!c),
    [carryItems]
  );
  const imageUrls = useObjectUrls(images);
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setEditCarryItem(undefined)
  });
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false, {
      onClose: () => setDeleteCarryItemRequest(undefined)
    });
  const [openedFilters, { open: openFilters, close: closeFilters }] =
    useDisclosure(false);

  const increaseCarryItemCount = (carryItem: CarryItem) =>
    updateCarryItem(carryItem.id, { carryCount: carryItem.carryCount + 1 });

  const isLoading = carryItems === undefined || filterOptions === undefined;
  const shouldRenderMasonry = !isLoading && carryItems.length > 0;
  const hasNoItems = !isLoading && carryItems.length === 0;

  return (
    <>
      <ResponsiveScrollArea>
        <AnimatePresence>
          <ItemFilters
            closeFilters={closeFilters}
            filterOptions={filterOptions}
            filteredItemCount={carryItems?.length ?? 0}
            filters={filters}
            openedFilters={openedFilters}
            openFilters={openFilters}
            setFilters={setFilters}
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
                      imageUrl={imageUrls[idx]}
                      onDelete={() => {
                        setDeleteCarryItemRequest(item);
                        openDelete();
                      }}
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
          customFieldsValueMap={filterOptions?.customFieldsValueMap ?? {}}
          opened={opened}
          close={close}
          onSubmit={(carryItem) =>
            editCarryItem
              ? updateCarryItem(editCarryItem.id, carryItem)
              : createCarryItem(carryItem)
          }
        />

        <DeleteCarryItemConfirm
          carryItemName={deleteCarryItemRequest?.name}
          opened={deleteOpened}
          close={closeDelete}
          onConfirm={async () => {
            if (!deleteCarryItemRequest) {
              return;
            }
            await deleteCarryItem(deleteCarryItemRequest.id);
          }}
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
