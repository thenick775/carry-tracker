import { Center, Stack, Text } from '@mantine/core';

import { CycleIcon } from './cycle-icon.tsx';

export const NoRotations = () => (
  <Center mih="60vh">
    <Stack align="center" gap="xs">
      <CycleIcon />
      <Text fw={500} size="lg">
        Your rotation list is empty
      </Text>
      <Text c="dimmed" ta="center" size="sm" maw={280}>
        Tap the <b style={{ verticalAlign: 'middle' }}>{`\u2795`}</b> button
        below to build a rotation after adding your every day carry items.
      </Text>
    </Stack>
  </Center>
);
