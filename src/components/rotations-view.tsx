import { ActionIcon, Grid, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'preact/hooks';
import { TbPlus } from 'react-icons/tb';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { RotationCard } from './rotation/rotation-card.tsx';
import { RotationModal } from './rotation/rotation-modal.tsx';
import { useRotations, type Rotation } from '../hooks/use-rotations.ts';

export const RotationsView = () => {
  const { rotations, createRotation, updateRotation, deleteRotation } =
    useRotations();
  const [editRotation, setEditRotation] = useState<Rotation>();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setEditRotation(undefined)
  });

  return (
    <>
      <ResponsiveScrollArea>
        <Text mb="sm">Rotations:</Text>
        <Grid gutter={'8px'}>
          {rotations?.map((rotation) => (
            <Grid.Col
              key={rotation.id}
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            >
              <RotationCard
                key={rotation.id}
                rotation={rotation}
                onDelete={() => deleteRotation(rotation.id)}
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
