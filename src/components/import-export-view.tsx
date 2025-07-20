import { Button, Flex, Group, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { TbUpload, TbX, TbDatabase, TbCheck } from 'react-icons/tb';

import { exportDb, importDb } from '../db/db.ts';

const importWithNotifications = async (file: File) => {
  const id = notifications.show({
    loading: true,
    title: 'Importing database',
    message: 'Your data will be available shortly!',
    autoClose: false,
    withCloseButton: false
  });

  try {
    await importDb(file);

    notifications.update({
      id,
      color: 'teal',
      title: 'Database loaded',
      message: 'Import complete, your data is available!',
      icon: <TbCheck size={18} />,
      loading: false,
      autoClose: 2000
    });
  } catch {
    notifications.update({
      id,
      color: 'var(--mantine-color-red-6)',
      title: 'Database import failed',
      message: 'Please attempt with a new export',
      loading: false,
      icon: <TbX size={18} />,
      withCloseButton: true
    });
  }
};

export const ImportExportView = () => (
  <Flex gap="xl" direction="column">
    Import and export your database here!
    <Dropzone
      onDrop={(files) => files.map(importWithNotifications)}
      onReject={(files) => console.log('rejected files', files)}
      accept={['application/json']}
      multiple={false}
    >
      <Group
        justify="center"
        gap="xl"
        mih={150}
        style={{ pointerEvents: 'none', textAlign: 'center' }}
      >
        <Dropzone.Accept>
          <TbUpload size={52} color="var(--mantine-color-blue-6)" />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <TbX size={52} color="var(--mantine-color-red-6)" />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <TbDatabase size={52} color="var(--mantine-color-dimmed)" />
        </Dropzone.Idle>

        <Text size="xl" inline>
          Drag your carry-db.json file here to import
        </Text>
      </Group>
    </Dropzone>
    <Button
      onClick={async () => {
        const dbExport = await exportDb();
        const url = URL.createObjectURL(dbExport);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'carry-db.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
      }}
    >
      Export
    </Button>
  </Flex>
);
