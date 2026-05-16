import { Card, Flex, Group, Skeleton } from '@mantine/core';

import { Masonry } from '../masonry/masonry.tsx';

const CarryItemCardSkeleton = () => (
  <Card shadow="md" padding="lg" radius="md" withBorder mb="md">
    <Group justify="space-between" mb="xs" style={{ flexWrap: 'nowrap' }}>
      <Skeleton height={18} radius="sm" w="60%" />
      <Skeleton height={24} circle />
    </Group>

    <Skeleton height={375} radius="md" mb="xs" />
    <Skeleton height={14} radius="sm" mb="xs" w="50%" />
    <Skeleton height={14} radius="sm" mb="xs" w="40%" />
    <Group gap="xs" mb="md">
      <Skeleton height={14} radius="sm" w={40} />
      <Skeleton height={16} circle />
    </Group>

    <Flex gap="xs">
      <Skeleton height={36} radius="sm" w="100%" />
      <Skeleton height={36} radius="sm" w="100%" />
    </Flex>
    <Skeleton height={36} radius="sm" mt="md" w="100%" />
  </Card>
);

export const MasonrySkeleton = ({ numCards = 8 }: { numCards?: number }) => {
  return (
    <>
      <Skeleton height={18} radius="sm" mb="sm" w={85} />
      <Masonry>
        {Array.from({ length: numCards }, (_, index) => index).map((idx) => (
          <CarryItemCardSkeleton key={idx} />
        ))}
      </Masonry>
    </>
  );
};
