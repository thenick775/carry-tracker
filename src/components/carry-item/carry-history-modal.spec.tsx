import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarryHistoryModal } from './carry-history-modal.tsx';
import {
  renderWithContext,
  screen
} from '../../../test/render-with-context.tsx';
import * as carriesOverTimeHooks from '../../hooks/use-carries-over-time.ts';

import type { CarryOverTimeStorage } from '../../db/db.ts';

describe('<CarryHistoryModal />', () => {
  const entry = (
    overrides: Partial<CarryOverTimeStorage>
  ): CarryOverTimeStorage => ({
    id: 'entry-id',
    carryItemId: 'item-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    currentCarryCount: 0,
    ...overrides
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
      saveCarryHistory: vi.fn()
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
      saveCarryHistory: vi.fn()
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
    expect(screen.getByText('Current count: -1')).toBeVisible();
  });

  it('disables saving when a recorded time is invalid', () => {
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [
        entry({ id: 'a', createdAt: 'not a date', currentCarryCount: 1 })
      ],
      totalCarryHistoryEntries: 1,
      firstRecordedAt: 'not a date',
      lastRecordedAt: 'not a date',
      saveCarryHistory: vi.fn()
    });

    renderWithContext(
      <CarryHistoryModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 1,
          color: 'blue'
        }}
        opened
        close={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('updates a draft entry before saving', async () => {
    const user = userEvent.setup();
    const saveCarryHistorySpy = vi.fn();
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [
        entry({ id: 'a', currentCarryCount: 1 }),
        entry({
          id: 'b',
          createdAt: '2026-01-02T00:00:00.000Z',
          currentCarryCount: 2
        })
      ],
      totalCarryHistoryEntries: 2,
      firstRecordedAt: '2026-01-01T00:00:00.000Z',
      lastRecordedAt: '2026-01-01T00:00:00.000Z',
      saveCarryHistory: saveCarryHistorySpy
    });

    renderWithContext(
      <CarryHistoryModal
        carryItem={{
          id: 'item-1',
          name: 'Knife',
          carryCount: 1,
          color: 'blue'
        }}
        opened
        close={() => undefined}
      />
    );

    await user.click(screen.getByRole('button', { name: /^.*Count: 1$/ }));
    const carryCountInput = await screen.findByRole('textbox', {
      name: 'Carry count'
    });
    await user.click(carryCountInput);
    await user.keyboard('{Control>}a{/Control}3');

    expect(screen.getByRole('textbox', { name: 'Carry count' })).toHaveValue(
      '3'
    );
    expect(screen.getByText('Current count: 2')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(saveCarryHistorySpy).toHaveBeenCalledExactlyOnceWith([
      {
        id: 'a',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 3
      },
      {
        id: 'b',
        createdAt: '2026-01-02T00:00:00.000Z',
        currentCarryCount: 2
      }
    ]);
  });

  it('deletes a draft entry', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [
        entry({ id: 'a', currentCarryCount: 1 }),
        entry({
          id: 'b',
          createdAt: '2026-01-02T00:00:00.000Z',
          currentCarryCount: 2
        })
      ],
      totalCarryHistoryEntries: 2,
      firstRecordedAt: '2026-01-01T00:00:00.000Z',
      lastRecordedAt: '2026-01-02T00:00:00.000Z',
      saveCarryHistory: vi.fn()
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

    await user.click(screen.getByRole('button', { name: /^.*Count: 1$/ }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(screen.getByText('1 entry')).toBeVisible();
    expect(screen.queryByText('Count: 1')).not.toBeInTheDocument();
    expect(screen.getByText('Count: 2')).toBeVisible();
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
      saveCarryHistory: vi.fn()
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

    expect(screen.getByText('3 entries')).toBeVisible();
    expect(screen.getByText('Current count: 4')).toBeVisible();
    expect(screen.getAllByDisplayValue('4')).toHaveLength(2);
  });

  it('adds the first entry with a zero carry count', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [],
      totalCarryHistoryEntries: 0,
      firstRecordedAt: undefined,
      lastRecordedAt: undefined,
      saveCarryHistory: vi.fn()
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

    expect(screen.getByText('1 entry')).toBeVisible();
    expect(screen.getByText('Current count: 0')).toBeVisible();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  it('saves sorted entries and closes the modal', async () => {
    const user = userEvent.setup();
    const closeSpy = vi.fn();
    const saveCarryHistorySpy = vi.fn();
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
      saveCarryHistory: saveCarryHistorySpy
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
        close={closeSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(saveCarryHistorySpy).toHaveBeenCalledExactlyOnceWith([
      {
        id: 'a',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 1
      },
      { id: 'b', createdAt: '2026-01-02T00:00:00.000Z', currentCarryCount: 4 }
    ]);
    expect(closeSpy).toHaveBeenCalledOnce();
  });
});
