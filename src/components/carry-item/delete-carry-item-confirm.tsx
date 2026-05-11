import { Button, Drawer, Group, Modal, Stack, Text } from '@mantine/core';

import { useIsLargerThanPhone } from '../../hooks/use-is-larger-than-phone.ts';

type DeleteCarryItemConfirmProps = {
  carryItemName?: string;
  opened: boolean;
  close: () => void;
  onConfirm: () => void;
};

export const DeleteCarryItemConfirm = ({
  carryItemName,
  opened,
  close,
  onConfirm
}: DeleteCarryItemConfirmProps) => {
  const isLargerThanPhone = useIsLargerThanPhone();

  const content = (
    <Stack gap="lg">
      <Text>
        Delete{' '}
        <Text span fw={600}>
          {carryItemName ?? 'this item'}
        </Text>
        ? This action cannot be undone.
      </Text>

      <Group justify="flex-end">
        <Button variant="default" onClick={close}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => {
            onConfirm();
            close();
          }}
        >
          Delete
        </Button>
      </Group>
    </Stack>
  );

  if (isLargerThanPhone) {
    return (
      <Modal
        opened={opened}
        onClose={close}
        title="Delete item"
        centered
        size="sm"
        radius="md"
      >
        {content}
      </Modal>
    );
  }

  return (
    <Drawer
      opened={opened}
      onClose={close}
      title="Delete item"
      position="bottom"
      size="200px"
      radius="md"
    >
      {content}
    </Drawer>
  );
};
