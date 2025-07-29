import { Center, Stack, Text } from '@mantine/core';

import { BriefcaseIcon } from './briefcase-icon.tsx';

export const NoItems = () => (
  <Center mih="60vh">
    <Stack align="center" gap="xs">
      <BriefcaseIcon />
      <Text fw={500} size="lg">
        Your item list is empty
      </Text>
      <Text c="dimmed" ta="center" size="sm" maw={280}>
        Tap the <b style={{ verticalAlign: 'middle' }}>{`\u2795`}</b> button
        below to start tracking your every day carry items.
      </Text>
    </Stack>
  </Center>
);
