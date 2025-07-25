import {
  Button,
  Flex,
  Group,
  Modal,
  NumberInput,
  Select,
  Switch,
  TextInput
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';

import { TransferList } from './transfer-list.tsx';
import { useCarryItems } from '../../hooks/use-carry-items.ts';
import { useIsLargerThanPhone } from '../../hooks/use-is-larger-than-phone.ts';

import type { Rotation, CreateRotation } from '../../hooks/use-rotations.ts';

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

const shuffle = (array: string[]) => {
  const cloned = [...array];
  for (let i = cloned.length - 1; i >= 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
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
      stepDuration: {
        duration: 1,
        unit: 'day'
      },
      ...defaultValues
    },
    transformValues: ({ active, createdAt, activeAt, ...rest }) => ({
      ...rest,
      active,
      createdAt: dayjs(createdAt).toISOString(),
      activeAt:
        active && !activeAt
          ? dayjs().toISOString()
          : active && activeAt
          ? dayjs(activeAt).toISOString()
          : undefined
    }),
    validate: {
      name: (value) => (value ? null : 'Invalid name'),
      createdAt: (value) =>
        dayjs(value).isValid() ? null : 'Invalid created date time',
      activeAt: (value) =>
        !value || dayjs(value).isValid() ? null : 'Invalid active at date time'
    }
  });

  const orderedCarryItemIds = form.getValues().orderedCarryItemIds;

  const unPickedCarryItems = {
    label: 'Items',
    values:
      carryItemIdentifiers
        ?.filter((item) => !orderedCarryItemIds.includes(item.id))
        .map(({ id, name }) => ({ name, value: id })) ?? []
  };

  const pickedCarryItems = {
    label: 'Rotation',
    values:
      orderedCarryItemIds
        .map((id) => carryItemIdentifiers?.find((c) => c.id === id))
        .filter((v) => !!v)
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
          onChange={(_, rightValues) =>
            form.setValues({
              orderedCarryItemIds: rightValues.map((v) => v.value)
            })
          }
        />
        <Button
          onClick={() =>
            form.setValues((prevState) => ({
              orderedCarryItemIds: shuffle(prevState.orderedCarryItemIds ?? [])
            }))
          }
        >
          Shuffle
        </Button>
        <Flex justify={'space-between'} gap="md">
          <NumberInput
            label="Item Duration"
            size="md"
            {...form.getInputProps('stepDuration.duration')}
          />
          <Select
            allowDeselect={false}
            label="Unit"
            size="md"
            data={['minute', 'hour', 'day', 'week', 'month', 'year']}
            comboboxProps={{
              withinPortal: false,
              transitionProps: { transition: 'scale-y', duration: 200 }
            }}
            {...form.getInputProps('stepDuration.unit')}
          />
        </Flex>
        <Switch
          label="Active"
          placeholder="Active"
          size="md"
          {...form.getInputProps('active', { type: 'checkbox' })}
        />
        {defaultValues?.active && form.getValues().active && (
          <DateTimePicker
            withSeconds
            label="Active since"
            valueFormat="MMM DD YYYY hh:mm:ss A"
            size="md"
            dropdownType="modal"
            styles={{ input: { width: '100%' } }}
            {...form.getInputProps('activeAt')}
          />
        )}
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </Flex>
    </form>
  );
};

export const RotationModal = ({
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
