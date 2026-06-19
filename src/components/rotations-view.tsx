import { ActionIcon, Grid, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { TbPlus } from 'react-icons/tb';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { DeleteRotationConfirm } from './rotation/delete-rotation-confirm.tsx';
import { RotationCard } from './rotation/rotation-card.tsx';
import { RotationModal } from './rotation/rotation-modal.tsx';
import { useRotations, type Rotation } from '../hooks/use-rotations.ts';
import { NoRotations } from './rotation/no-rotations.tsx';

export const RotationsView = () => {
  const { rotations, createRotation, updateRotation, deleteRotation } =
    useRotations();
  const [editRotation, setEditRotation] = useState<Rotation>();
  const [deleteRotationRequest, setDeleteRotationRequest] =
    useState<Rotation>();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setEditRotation(undefined)
  });
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false, {
      onClose: () => setDeleteRotationRequest(undefined)
    });
  const isLoading = rotations === undefined;
  const hasNoItems = !isLoading && rotations.length === 0;

  return (
    <>
      <ResponsiveScrollArea>
        <Text mb="sm">Rotations:</Text>
        {hasNoItems && <NoRotations />}
        <Grid gap="8px">
          {rotations?.map((rotation) => (
            <Grid.Col
              key={rotation.id}
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            >
              <RotationCard
                key={rotation.id}
                rotation={rotation}
                onDelete={() => {
                  setDeleteRotationRequest(rotation);
                  openDelete();
                }}
                onRequestEdit={() => {
                  setEditRotation(rotation);
                  open();
                }}
              />
            </Grid.Col>
          ))}
        </Grid>

        <RotationModal
          rotation={editRotation}
          opened={opened}
          close={close}
          onSubmit={(rotation) =>
            editRotation
              ? updateRotation(editRotation.id, rotation)
              : createRotation(rotation)
          }
        />

        <DeleteRotationConfirm
          rotationName={deleteRotationRequest?.name}
          opened={deleteOpened}
          close={closeDelete}
          onConfirm={async () => {
            if (!deleteRotationRequest) {
              return;
            }

            await deleteRotation(deleteRotationRequest.id);
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
