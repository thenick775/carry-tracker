import { Center, Button, Flex, FileButton } from '@mantine/core';

import { exportDb, importDb } from '../db/db.ts';

// TODO: better styling
export const ImportExportView = () => {
  return (
    <Center h="100%" w="100%" bg="var(--mantine-color-gray-light)">
      <Flex gap="xl" direction="column" bg="var(--mantine-color-blue-light)">
        Import and export your database here!
        <Flex m="md" mt="auto" gap="md" justify="space-around">
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
          <FileButton
            onChange={async (file: File | null) => {
              if (file) await importDb(file);
            }}
          >
            {(props) => <Button {...props}>Import</Button>}
          </FileButton>
        </Flex>
      </Flex>
    </Center>
  );
};
