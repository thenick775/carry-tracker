import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarryHistoryModal } from './carry-history-modal.tsx';
import * as carriesOverTimeHooks from '../../hooks/use-carries-over-time.ts';
import * as responsiveHooks from '../../hooks/use-is-larger-than-phone.ts';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../test/render-with-context.tsx';

import type { CarryOverTimeStorage } from '../../db/db.ts';

const saveCarryHistory = vi.fn();

const entry = (
  overrides: Partial<CarryOverTimeStorage>
): CarryOverTimeStorage => ({
  id: 'entry-id',
  carryItemId: 'item-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  currentCarryCount: 0,
  ...overrides
});

describe('CarryHistoryModal', () => {
  beforeEach(() => {
    saveCarryHistory.mockReset();
    vi.spyOn(responsiveHooks, 'useIsLargerThanPhone').mockReturnValue(true);
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [],
      totalCarryHistoryEntries: 0,
      firstRecordedAt: undefined,
      lastRecordedAt: undefined,
      saveCarryHistory
    });
  });

  it('disables saving when duplicate timestamps exist', () => {
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [
        entry({ id: 'a', currentCarryCount: 1 }),
        entry({ id: 'b', currentCarryCount: 2 })
      ],
      totalCarryHistoryEntries: 2,
      firstRecordedAt: '2026-01-01T00:00:00.000Z',
      lastRecordedAt: '2026-01-01T00:00:00.000Z',
      saveCarryHistory
    });

    renderWithContext(
      <CarryHistoryModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 2,
          color: 'blue'
        }}
        opened
        close={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getAllByLabelText('Recorded at')).toHaveLength(2);
  });

  it('disables saving when a negative count exists', () => {
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [entry({ id: 'a', currentCarryCount: -1 })],
      totalCarryHistoryEntries: 1,
      firstRecordedAt: '2026-01-01T00:00:00.000Z',
      lastRecordedAt: '2026-01-01T00:00:00.000Z',
      saveCarryHistory
    });

    renderWithContext(
      <CarryHistoryModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 0,
          color: 'blue'
        }}
        opened
        close={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getByText('Current count: -1')).toBeInTheDocument();
  });

  it('adds a new entry using the latest count as the starting value', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [
        entry({ id: 'a', currentCarryCount: 1 }),
        entry({
          id: 'b',
          createdAt: '2026-01-02T00:00:00.000Z',
          currentCarryCount: 4
        })
      ],
      totalCarryHistoryEntries: 2,
      firstRecordedAt: '2026-01-01T00:00:00.000Z',
      lastRecordedAt: '2026-01-02T00:00:00.000Z',
      saveCarryHistory
    });

    renderWithContext(
      <CarryHistoryModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 4,
          color: 'blue'
        }}
        opened
        close={() => undefined}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(screen.getByText('3 entries')).toBeInTheDocument();
    expect(screen.getByText('Current count: 4')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('4')).toHaveLength(2);
  });

  it('saves sorted entries and closes the modal', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [
        entry({
          id: 'b',
          createdAt: '2026-01-02T00:00:00.000Z',
          currentCarryCount: 4
        }),
        entry({ id: 'a', currentCarryCount: 1 })
      ],
      totalCarryHistoryEntries: 2,
      firstRecordedAt: '2026-01-01T00:00:00.000Z',
      lastRecordedAt: '2026-01-02T00:00:00.000Z',
      saveCarryHistory
    });

    renderWithContext(
      <CarryHistoryModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 4,
          color: 'blue'
        }}
        opened
        close={close}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(saveCarryHistory).toHaveBeenCalledWith([
        {
          id: 'a',
          createdAt: '2026-01-01T00:00:00.000Z',
          currentCarryCount: 1
        },
        { id: 'b', createdAt: '2026-01-02T00:00:00.000Z', currentCarryCount: 4 }
      ]);
    });
    expect(close).toHaveBeenCalled();
  });
});
