import {
  Button,
  ColorInput,
  FileInput,
  Flex,
  Group,
  Modal,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import randomColor from 'randomcolor';

import type { CarryItem, CreateCarryItem } from '../hooks/use-carry-items';

type CreateCarryItemModalProps = {
  carryItem?: CarryItem;
  opened: boolean;
  close: () => void;
  onSubmit: (formValues: CreateCarryItem) => void;
};

type CarryItemFormProps = {
  close: () => void;
  onSubmit: (formValues: CreateCarryItem) => void;
  defaultValues?: CreateCarryItem;
};

const CarryItemForm = ({
  onSubmit,
  close,
  defaultValues,
}: CarryItemFormProps) => {
  const form = useForm<CreateCarryItem>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      carryCount: 0,
      createdAt: dayjs().toISOString(),
      color: randomColor(),
      ...defaultValues,
    },
    transformValues: (values) => ({
      ...values,
      createdAt: dayjs(values.createdAt).toISOString(),
    }),
    validate: {
      name: (value) => (value ? null : 'Invalid name'),
      createdAt: (value) =>
        dayjs(value).isValid() ? null : 'Invalid added date time',
      color: (value) => (value ? null : 'Invalid color'),
      imageData: (value) => (value ? null : 'Invalid image'),
    },
  });

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
        <FileInput
          accept="image/png,image/jpeg"
          clearable
          label="Image"
          placeholder="Image"
          {...form.getInputProps('imageData')}
        />
        <DateTimePicker
          w="100%"
          withSeconds
          label="Added"
          placeholder="Added"
          valueFormat="MMM DD YYYY hh:mm:ss A"
          size="md"
          dropdownType="modal"
          styles={{ input: { width: '100%' } }}
          {...form.getInputProps('createdAt')}
        />
        <NumberInput
          label="Carry Count"
          size="md"
          {...form.getInputProps('carryCount')}
        />
        <ColorInput
          label="Color"
          placeholder="Color"
          size="md"
          {...form.getInputProps('color')}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </Flex>
    </form>
  );
};

export const CarryItemModal = ({
  carryItem,
  opened,
  close,
  onSubmit,
}: CreateCarryItemModalProps) => (
  <Modal
    opened={opened}
    onClose={close}
    title="Create Carry Item"
    keepMounted={false}
    fullScreen
  >
    <CarryItemForm
      defaultValues={carryItem}
      onSubmit={onSubmit}
      close={close}
    />
  </Modal>
);
