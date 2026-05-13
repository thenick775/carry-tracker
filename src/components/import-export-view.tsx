import {
  Button,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  useMantineTheme
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { TbUpload, TbX, TbDatabase, TbCheck } from 'react-icons/tb';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { exportDb, importDb } from '../db/db.ts';
import { useIsLargerThanPhone } from '../hooks/use-is-larger-than-phone.ts';

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

export const ImportExportView = () => {
  const theme = useMantineTheme();
  const isLargerThanPhone = useIsLargerThanPhone();
  const [pendingImportFile, setPendingImportFile] = useState<File>();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    const dbExport = await exportDb().finally(() => setIsExporting(false));
    const url = URL.createObjectURL(dbExport);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carry-db.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <ResponsiveScrollArea>
      <Flex
        gap="xl"
        direction="column"
        maw={theme.breakpoints.sm}
        mx="auto"
        px={isLargerThanPhone ? 'md' : undefined}
      >
        <Text>Import and export your database here!</Text>

        <Stack gap="md">
          <Stack gap={2}>
            <Text fw={600}>Import Backup</Text>
            <Text size="sm" c="dimmed">
              Replace this database fully with a json backup.
            </Text>
          </Stack>

          <Dropzone
            onDrop={([file]) => setPendingImportFile(file)}
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
                Drag your carry-db.json file here
              </Text>
            </Group>
          </Dropzone>

          {pendingImportFile && (
            <Stack gap="sm">
              <Text fw={500}>Upload: {pendingImportFile.name}</Text>
              <Flex gap="md">
                <Button
                  w="100%"
                  variant="default"
                  onClick={() => setPendingImportFile(undefined)}
                >
                  Cancel
                </Button>
                <Button
                  w="100%"
                  onClick={async () => {
                    await importWithNotifications(pendingImportFile);
                    setPendingImportFile(undefined);
                  }}
                >
                  Import
                </Button>
              </Flex>
            </Stack>
          )}
        </Stack>

        <Divider />

        <Stack gap="md">
          <Stack gap={2}>
            <Text fw={600}>Export Backup</Text>
            <Text size="sm" c="dimmed">
              Download the current items, history, and rotations from this
              device as a json file.
            </Text>
          </Stack>

          <Button onClick={handleExport} loading={isExporting}>
            Export
          </Button>
        </Stack>
      </Flex>
    </ResponsiveScrollArea>
  );
};
