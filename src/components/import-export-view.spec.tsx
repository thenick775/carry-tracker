import * as notificationsModule from '@mantine/notifications';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImportExportView } from './import-export-view.tsx';
import {
  fireEvent,
  renderWithContext,
  screen,
  waitFor
} from '../test/render-with-context.tsx';

const { show, update, exportDb, importDb } = vi.hoisted(() => ({
  show: vi.fn<(input: unknown) => string>(),
  update: vi.fn<(...input: unknown[]) => void>(),
  exportDb: vi.fn<() => Promise<Blob>>(),
  importDb: vi.fn<(file: File) => Promise<void>>()
}));

const createDropEvent = (file: File) => ({
  dataTransfer: {
    files: [file],
    items: [
      {
        kind: 'file',
        type: file.type,
        getAsFile: () => file
      }
    ],
    types: ['Files']
  }
});

vi.mock('../db/db.ts', () => ({
  exportDb,
  importDb
}));

describe('<ImportExportView />', () => {
  beforeEach(() => {
    vi.spyOn(notificationsModule.notifications, 'show').mockImplementation(
      show
    );
    vi.spyOn(notificationsModule.notifications, 'update').mockImplementation(
      (...args) => {
        update(...args);
        return undefined;
      }
    );
  });

  it('renders the import and export sections', () => {
    renderWithContext(<ImportExportView />);

    expect(screen.getByText('Import Backup')).toBeInTheDocument();
    expect(screen.getByText('Export Backup')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('shows a pending import file and lets the user cancel it', async () => {
    const user = userEvent.setup();
    const file = new File(['{}'], 'carry-db.json', {
      type: 'application/json'
    });

    renderWithContext(<ImportExportView />);

    fireEvent.drop(screen.getByLabelText('Upload File'), createDropEvent(file));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import' })).toBeVisible();
    });

    expect(screen.getByText('Upload: carry-db.json')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Upload: carry-db.json')).not.toBeInTheDocument();
  });

  it('imports successfully and shows success notification updates', async () => {
    const user = userEvent.setup();
    const file = new File(['{}'], 'carry-db.json', {
      type: 'application/json'
    });
    show.mockReturnValue('import-id');

    renderWithContext(<ImportExportView />, { withNotifications: true });

    fireEvent.drop(screen.getByLabelText('Upload File'), createDropEvent(file));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import' })).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(importDb).toHaveBeenCalledWith(file);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Importing database' })
    );
    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'import-id',
          title: 'Database loaded'
        })
      );
    });
  });

  it('shows an error notification when import fails', async () => {
    const user = userEvent.setup();
    const file = new File(['{}'], 'carry-db.json', {
      type: 'application/json'
    });
    show.mockReturnValue('import-id');
    importDb.mockRejectedValueOnce(new Error('bad import'));

    renderWithContext(<ImportExportView />, { withNotifications: true });

    fireEvent.drop(screen.getByLabelText('Upload File'), createDropEvent(file));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Import' })).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'import-id',
          title: 'Database import failed'
        })
      );
    });
  });

  it('exports the database through a download link', async () => {
    const user = userEvent.setup();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    exportDb.mockResolvedValue(new Blob(['{}'], { type: 'application/json' }));

    renderWithContext(<ImportExportView />);

    await user.click(screen.getByRole('button', { name: 'Export' }));

    expect(exportDb).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();

    click.mockRestore();
  });
});
