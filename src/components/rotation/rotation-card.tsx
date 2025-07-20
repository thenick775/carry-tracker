import {
  Card,
  Group,
  ActionIcon,
  Button,
  Text,
  Badge,
  Flex
} from '@mantine/core';
import { TbX } from 'react-icons/tb';

import type { Rotation } from '../../hooks/use-rotations';

type RotationCardProps = {
  rotation: Rotation;
  onDelete: () => void;
  onRequestEdit: () => void;
};

export const RotationCard = ({
  rotation,
  onDelete,
  onRequestEdit
}: RotationCardProps) => {
  return (
    <Card shadow="md" padding="lg" radius="md" withBorder mb="md">
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{rotation.name}</Text>
        <Flex gap="md">
          {!!rotation.activeAt && <Badge color="blue">Active</Badge>}
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            aria-label="Delete tracker"
            onClick={onDelete}
          >
            <TbX size={18} />
          </ActionIcon>
        </Flex>
      </Group>

      <Button mt="md" fullWidth variant="light" onClick={onRequestEdit}>
        Edit
      </Button>
    </Card>
  );
};
