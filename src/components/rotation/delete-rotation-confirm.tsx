import { Button, Drawer, Group, Modal, Stack, Text } from '@mantine/core';

import { useIsLargerThanPhone } from '../../hooks/use-is-larger-than-phone.ts';

type DeleteRotationConfirmProps = {
  opened: boolean;
  close: () => void;
  onConfirm: () => void;
  rotationName?: string;
};

export const DeleteRotationConfirm = ({
  opened,
  close,
  onConfirm,
  rotationName
}: DeleteRotationConfirmProps) => {
  const isLargerThanPhone = useIsLargerThanPhone();

  const content = (
    <Stack gap="lg">
      <Text>
        Delete{' '}
        <Text span fw={600}>
          {rotationName ?? 'this rotation'}
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
        title="Delete rotation"
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
      title="Delete rotation"
      position="bottom"
      size="200px"
      radius="md"
    >
      {content}
    </Drawer>
  );
};
