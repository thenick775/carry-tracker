import { Center, Stack, Text } from '@mantine/core';

import { TimelineIcon } from './timeline-icon.tsx';

export const NoTimeline = () => (
  <Center mih="60vh" mt={36}>
    <Stack align="center" gap="xs">
      <TimelineIcon />
      <Text fw={500} size="lg">
        Your rotation timeline is empty
      </Text>
      <Text c="dimmed" ta="center" size="sm" maw={280}>
        Activate a rotation to see when each carry item is scheduled to come up
        next.
      </Text>
    </Stack>
  </Center>
);
