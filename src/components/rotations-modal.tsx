import { Button, Flex, Group, Modal, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';

import { TransferList } from './transfer-list.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';

import type { Rotation, CreateRotation } from '../hooks/use-rotations.ts';

type CreateRotationItemModalProps = {
  rotation?: Rotation;
  opened: boolean;
  close: () => void;
  onSubmit: (formValues: CreateRotation) => void;
};

type RotationFormProps = {
  onSubmit: (formValues: CreateRotation) => void;
  close: () => void;
  defaultValues?: CreateRotation;
  carryItemIdentifiers?: {
    id: string;
    name: string;
  }[];
};

const RotationForm = ({
  onSubmit,
  close,
  defaultValues,
  carryItemIdentifiers
}: RotationFormProps) => {
  const form = useForm<CreateRotation>({
    mode: 'uncontrolled',
    initialValues: {
      active: true,
      name: '',
      createdAt: dayjs().toISOString(),
      orderedCarryItemIds: [],
      ...defaultValues
    },
    transformValues: ({ active, createdAt, ...rest }) => ({
      ...rest,
      active,
      createdAt: dayjs(createdAt).toISOString(),
      activeAt: active ? dayjs().toISOString() : undefined
    }),
    validate: {
      name: (value) => (value ? null : 'Invalid name'),
      createdAt: (value) =>
        dayjs(value).isValid() ? null : 'Invalid added date time',
      activeAt: (value) =>
        !value || dayjs(value).isValid() ? null : 'Invalid added date time'
    }
  });

  const unPickedCarryItems = {
    label: 'Carry Items',
    values:
      carryItemIdentifiers
        ?.filter(
          (item) => !defaultValues?.orderedCarryItemIds.includes(item.id)
        )
        .map(({ id, name }) => ({ name, value: id })) ?? []
  };

  const pickedCarryItems = {
    label: 'Rotation Items',
    values:
      carryItemIdentifiers
        ?.filter((item) => defaultValues?.orderedCarryItemIds.includes(item.id))
        .map(({ id, name }) => ({ name, value: id })) ?? []
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        onSubmit(values);
        close();
      })}
    >
      <Flex direction="column" gap="md">
        <TextInput
          label="Name"
          placeholder="Name"
          size="md"
          {...form.getInputProps('name')}
        />
        <TransferList
          left={unPickedCarryItems}
          right={pickedCarryItems}
          onChange={(leftValues, rightValues) => {
            console.log('vancise submitted values', leftValues, rightValues);

            form.setValues({
              orderedCarryItemIds: rightValues.map((v) => v.value)
            });
          }}
        />
        <Switch
          w="100%"
          label="Active"
          placeholder="Active"
          size="md"
          {...form.getInputProps('active', { type: 'checkbox' })}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </Flex>
    </form>
  );
};

export const RotationsModal = ({
  rotation,
  opened,
  close,
  onSubmit
}: CreateRotationItemModalProps) => {
  const { carryItems } = useCarryItems();
  const isLargerThanPhone = useIsLargerThanPhone();

  const carryItemIdentifiers = carryItems?.map(({ id, name }) => ({
    id,
    name
  }));

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Create Rotation"
      keepMounted={false}
      fullScreen={!isLargerThanPhone}
    >
      <RotationForm
        defaultValues={rotation}
        onSubmit={onSubmit}
        close={close}
        carryItemIdentifiers={carryItemIdentifiers}
      />
    </Modal>
  );
};
