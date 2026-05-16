import { ActionIcon, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { TbPlus } from 'react-icons/tb';

import { CarryHistoryModal } from './carry-item/carry-history-modal.tsx';
import { CarryItemCard } from './carry-item/carry-item-card.tsx';
import { CarryItemModal } from './carry-item/carry-item-modal.tsx';
import { DeleteCarryItemConfirm } from './carry-item/delete-carry-item-confirm.tsx';
import { MasonrySkeleton } from './carry-item/masonry-skeleton.tsx';
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
import { useDelayedSkeleton } from '../hooks/use-delayed-skeleton.ts';
import { useObjectUrls } from '../hooks/use-object-urls.ts';

export const ItemsView = () => {
  const [filters, setFilters] = useState<CarryItemFilters>({});
  const filterOptions = useCarryItemFilterOptions();
  const { carryItems, createCarryItem, updateCarryItem, deleteCarryItem } =
    useCarryItems(filters);
  const [editCarryItem, setEditCarryItem] = useState<CarryItem>();
  const [historyCarryItem, setHistoryCarryItem] = useState<CarryItem>();
  const [deleteCarryItemRequest, setDeleteCarryItemRequest] =
    useState<CarryItem>();
  const images = useMemo(
    () =>
      carryItems?.map((carryItem) => carryItem.imageData).filter((c) => !!c),
    [carryItems]
  );
  const imageUrls = useObjectUrls(images);
  const [opened, { open: openEdit, close: closeEdit }] = useDisclosure(false, {
    onClose: () => setEditCarryItem(undefined)
  });
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false, {
      onClose: () => setDeleteCarryItemRequest(undefined)
    });
  const [historyOpened, { open: openHistory, close: closeHistory }] =
    useDisclosure(false, {
      onClose: () => setHistoryCarryItem(undefined)
    });
  const [openedFilters, { open: openFilters, close: closeFilters }] =
    useDisclosure(false);

  const increaseCarryItemCount = (carryItem: CarryItem) =>
    updateCarryItem(carryItem.id, { carryCount: carryItem.carryCount + 1 });

  const isLoading = carryItems === undefined || filterOptions === undefined;
  const showLoadingSkeleton = useDelayedSkeleton();
  const shouldRenderMasonry = !isLoading && carryItems.length > 0;
  const hasNoItems = !isLoading && carryItems.length === 0;

  return (
    <>
      <ResponsiveScrollArea>
        <ItemFilters
          closeFilters={closeFilters}
          filterOptions={filterOptions}
          filteredItemCount={carryItems?.length ?? 0}
          filters={filters}
          openedFilters={openedFilters}
          openFilters={openFilters}
          setFilters={setFilters}
        />
        {isLoading && showLoadingSkeleton && <MasonrySkeleton />}
        {hasNoItems && <NoItems />}
        {shouldRenderMasonry && (
          <AnimatePresence>
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
                        openEdit();
                      }}
                      onRequestHistory={() => {
                        setHistoryCarryItem(item);
                        openHistory();
                      }}
                      onIncreaseCount={() => increaseCarryItemCount(item)}
                    />
                  ))}
              </Masonry>
            </motion.div>
          </AnimatePresence>
        )}

        <CarryItemModal
          carryItem={editCarryItem}
          customFieldsValueMap={filterOptions?.customFieldsValueMap ?? {}}
          opened={opened}
          close={closeEdit}
          onSubmit={(carryItem) =>
            editCarryItem
              ? updateCarryItem(editCarryItem.id, carryItem)
              : createCarryItem(carryItem)
          }
        />

        {historyCarryItem && (
          <CarryHistoryModal
            carryItem={historyCarryItem}
            opened={historyOpened}
            close={closeHistory}
          />
        )}

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
        onClick={openEdit}
      >
        <TbPlus size={25} />
      </ActionIcon>
    </>
  );
};
