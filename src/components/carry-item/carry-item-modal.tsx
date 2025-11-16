import {
  ActionIcon,
  Autocomplete,
  Button,
  ColorInput,
  Divider,
  FileInput,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, type UseFormReturnType } from '@mantine/form';
import dayjs from 'dayjs';
import randomColor from 'randomcolor';
import { TbPlus, TbTrash } from 'react-icons/tb';

import { useIsLargerThanPhone } from '../../hooks/use-is-larger-than-phone.ts';

import type { CustomFields } from '../../db/db.ts';
import type {
  CarryItem,
  CreateCarryItem
} from '../../hooks/use-carry-items.ts';

type CustomFieldsValueMap = Partial<Record<string, CustomFields>>;

type CreateCarryItemModalProps = {
  carryItem?: CarryItem;
  customFieldsValueMap: CustomFieldsValueMap;
  opened: boolean;
  close: () => void;
  onSubmit: (formValues: CreateCarryItem) => void;
};

type CarryItemFormProps = {
  close: () => void;
  onSubmit: (formValues: CreateCarryItem) => void;
  defaultValues?: CreateCarryItem;
  customFieldsValueMap: CustomFieldsValueMap;
};

export const CustomFieldsInput = ({
  form,
  customFieldsValueMap
}: {
  form: UseFormReturnType<CreateCarryItem>;
  customFieldsValueMap: CustomFieldsValueMap;
}) => {
  const fields = form.getValues().customFields ?? [];

  const addField = () =>
    form.setFieldValue('customFields', [...fields, { name: '', value: '' }]);

  const removeField = (i: number) =>
    form.setFieldValue(
      'customFields',
      fields.filter((_, idx) => idx !== i)
    );

  return (
    <Stack gap="xs">
      <Group justify="space-between" gap="xs">
        <span style={{ fontWeight: 600 }}>Custom fields</span>
        <ActionIcon
          size="sm"
          variant="subtle"
          aria-label="Add field"
          onClick={() => addField()}
        >
          <TbPlus />
        </ActionIcon>
      </Group>

      {fields.length === 0 ? (
        <TextInput
          size="xs"
          placeholder="Add custom fields (e.g. Brand, Model, Steel...)"
          readOnly
          onClick={() => addField()}
        />
      ) : (
        <Stack gap={4}>
          {fields.map((customField, i) => (
            <Stack key={i} gap={4}>
              <Group align="end" gap={6} wrap="nowrap">
                <Autocomplete
                  placeholder="e.g. Brand"
                  size="xs"
                  flex={1}
                  data={Object.keys(customFieldsValueMap)}
                  {...form.getInputProps(`customFields.${i}.name`)}
                />
                <Autocomplete
                  placeholder="e.g. your brand"
                  size="xs"
                  flex={1}
                  data={customFieldsValueMap[customField.name]}
                  {...form.getInputProps(`customFields.${i}.value`)}
                />
                <ActionIcon
                  size="md"
                  variant="subtle"
                  color="red"
                  aria-label="Remove field"
                  onClick={() => removeField(i)}
                >
                  <TbTrash />
                </ActionIcon>
              </Group>
              {i < fields.length - 1 && <Divider my={2} />}
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const CarryItemForm = ({
  onSubmit,
  close,
  defaultValues,
  customFieldsValueMap
}: CarryItemFormProps) => {
  const form = useForm<CreateCarryItem>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      carryCount: 0,
      createdAt: dayjs().toISOString(),
      color: randomColor(),
      imageData: undefined,
      cost: undefined,
      customFields: [],
      ...defaultValues
    },
    transformValues: (values) => ({
      ...values,
      createdAt: dayjs(values.createdAt).toISOString(),
      customFields: values.customFields?.map(({ name, value }) => ({
        name: name?.trim(),
        value: value?.trim()
      }))
    }),
    validate: {
      name: (value) => (value ? null : 'Invalid name'),
      createdAt: (value) =>
        dayjs(value).isValid() ? null : 'Invalid added date time',
      color: (value) => (value ? null : 'Invalid color'),
      imageData: (value) => (value ? null : 'Invalid image'),
      customFields: (fields) => {
        if (!fields || fields.length === 0) return null;

        for (const f of fields) {
          if ((f.value?.length ?? 0) > 0 && !(f.name?.trim().length > 0)) {
            return 'Each value must have a name';
          }
        }

        const names = fields
          .map((f) => f.name?.trim().toLowerCase())
          .filter(Boolean);
        const hasDuplicate = new Set(names).size !== names.length;
        return hasDuplicate ? 'Custom field names must be unique' : null;
      }
    }
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        onSubmit(values);
        close();
      })}
    >
      <Stack gap="md">
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
          thousandSeparator=","
          {...form.getInputProps('carryCount')}
        />
        <NumberInput
          label="Cost"
          size="md"
          min={0}
          decimalScale={2}
          prefix="$"
          thousandSeparator=","
          clampBehavior="strict"
          allowNegative={false}
          {...form.getInputProps('cost')}
        />
        <ColorInput
          label="Color"
          placeholder="Color"
          size="md"
          {...form.getInputProps('color')}
        />
        <CustomFieldsInput
          form={form}
          customFieldsValueMap={customFieldsValueMap}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </Stack>
    </form>
  );
};

export const CarryItemModal = ({
  carryItem,
  customFieldsValueMap,
  opened,
  close,
  onSubmit
}: CreateCarryItemModalProps) => {
  const isLargerThanPhone = useIsLargerThanPhone();

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={carryItem ? 'Update Carry Item' : 'Create Carry Item'}
      keepMounted={false}
      fullScreen={!isLargerThanPhone}
    >
      <CarryItemForm
        defaultValues={carryItem}
        customFieldsValueMap={customFieldsValueMap}
        onSubmit={onSubmit}
        close={close}
      />
    </Modal>
  );
};
