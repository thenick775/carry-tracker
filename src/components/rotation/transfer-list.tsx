import {
  ActionIcon,
  Checkbox,
  Combobox,
  Flex,
  Group,
  TextInput,
  useCombobox
} from '@mantine/core';
import { useState } from 'preact/hooks';
import {
  TbChevronLeft,
  TbChevronRight,
  TbChevronsLeft,
  TbChevronsRight
} from 'react-icons/tb';

import classes from './transfer-list.module.css';

type Option = { name: string; value: string };

type RenderListProps = {
  options: Option[];
  onTransfer: (options: string[]) => void;
  onTransferAll: () => void;
  type: 'forward' | 'backward';
  label: string;
};

const RenderList = ({
  options,
  onTransfer,
  onTransferAll,
  type,
  label
}: RenderListProps) => {
  const combobox = useCombobox();
  const [value, setValue] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const handleValueSelect = (val: string) =>
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );

  const items = options
    .filter((item) =>
      item.value.toLowerCase().includes(search.toLowerCase().trim())
    )
    .map((item) => (
      <Combobox.Option
        value={item.value}
        key={`${item.name}_${item.value}`}
        active={value.includes(item.value)}
        onMouseOver={() => combobox.resetSelectedOption()}
      >
        <Group gap="sm">
          <Checkbox
            checked={value.includes(item.value)}
            onChange={() => {}}
            aria-hidden
            tabIndex={-1}
            style={{ pointerEvents: 'none' }}
          />
          <span>{item.name}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Flex direction="column" w="100%" data-type={type}>
      <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
        <Combobox.EventsTarget>
          <Group wrap="nowrap" gap={0} className={classes.controls}>
            <TextInput
              placeholder={label}
              classNames={{ input: classes.input }}
              w="100%"
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                combobox.updateSelectedOptionIndex();
              }}
            />
            <ActionIcon
              radius={0}
              variant="default"
              size={36}
              className={classes.control}
              onClick={() => {
                onTransfer(value);
                setValue([]);
              }}
            >
              {type === 'forward' ? <TbChevronRight /> : <TbChevronLeft />}
            </ActionIcon>
            <ActionIcon
              radius={0}
              variant="default"
              size={36}
              className={classes.controlWithRadius}
              onClick={onTransferAll}
            >
              {type === 'forward' ? <TbChevronsRight /> : <TbChevronsLeft />}
            </ActionIcon>
          </Group>
        </Combobox.EventsTarget>

        <div className={classes.list}>
          <Combobox.Options>
            {items.length > 0 ? (
              items
            ) : (
              <Combobox.Empty>No Values</Combobox.Empty>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </Flex>
  );
};

export function TransferList({
  left,
  right,
  onChange
}: {
  left: { label: string; values: Option[] };
  right: { label: string; values: Option[] };
  onChange?: (leftValues: Option[], rightValues: Option[]) => void;
}) {
  const data = [left.values, right.values];

  const handleTransfer = (transferFrom: 0 | 1, options: string[]) => {
    const transferTo = transferFrom === 0 ? 1 : 0;
    const transferFromData = data[transferFrom].filter(
      (item) => !options.includes(item.value)
    );
    const fullOptions = data[transferFrom].filter((item) =>
      options.includes(item.value)
    );
    const transferToData = [...data[transferTo], ...fullOptions];

    const result = [];
    result[transferFrom] = transferFromData;
    result[transferTo] = transferToData;

    onChange?.(result[0], result[1]);
  };

  return (
    <div className={classes.root}>
      <RenderList
        type="forward"
        label={left.label}
        options={left.values}
        onTransfer={(options) => handleTransfer(0, options)}
        onTransferAll={() =>
          handleTransfer(
            0,
            left.values.map((o) => o.value)
          )
        }
      />
      <RenderList
        type="backward"
        label={right.label}
        options={right.values}
        onTransfer={(options) => handleTransfer(1, options)}
        onTransferAll={() =>
          handleTransfer(
            1,
            right.values.map((o) => o.value)
          )
        }
      />
    </div>
  );
}
