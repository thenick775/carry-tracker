import { Timeline, Skeleton } from '@mantine/core';

export const TimelineSkeleton = () => (
  <Timeline active={-1} bulletSize={24} lineWidth={2}>
    {Array.from({ length: 16 }, (_, index) => index).map((day) => (
      <Timeline.Item
        key={day}
        title={<Skeleton height={16} radius="sm" maw={200} />}
        style={{
          width: '100%',
          paddingBottom: 15
        }}
        lineVariant="dotted"
      >
        <Skeleton height={14} radius="sm" mb="xs" maw={400} />
      </Timeline.Item>
    ))}
  </Timeline>
);
