import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ItemsView } from './item-view.tsx';
import * as carriesOverTimeHooks from '../hooks/use-carries-over-time.ts';
import * as carryItemFilterOptionHooks from '../hooks/use-carry-item-filter-options.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as objectUrlHooks from '../hooks/use-object-urls.ts';
import {
  renderWithContext,
  screen,
  waitFor
} from '../test/render-with-context.tsx';

const createCarryItem = vi.fn();
const updateCarryItem = vi.fn();
const deleteCarryItem = vi.fn();

describe('ItemsView', () => {
  beforeEach(() => {
    vi.spyOn(carryItemFilterOptionHooks, 'useCarryItemFilterOptions').mockReturnValue({
      customFieldOptions: {},
      customFieldsValueMap: {}
    });
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 4,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue'
        }
      ],
      createCarryItem,
      updateCarryItem,
      deleteCarryItem
    });
    vi.spyOn(objectUrlHooks, 'useObjectUrls').mockReturnValue(['blob:knife']);
    vi.spyOn(carriesOverTimeHooks, 'useCarryHistory').mockReturnValue({
      carryHistory: [],
      totalCarryHistoryEntries: 0,
      firstRecordedAt: undefined,
      lastRecordedAt: undefined,
      saveCarryHistory: vi.fn()
    });
  });

  it('renders item cards from the hook', () => {
    renderWithContext(<ItemsView />);

    expect(screen.getByText('Knife')).toBeInTheDocument();
    expect(screen.getByText('Carry Items:')).toBeInTheDocument();
  });

  it('opens create flow from the add button', async () => {
    const user = userEvent.setup();

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(screen.getByText('Create Carry Item')).toBeInTheDocument();
  });

  it('opens the history modal from the item card', async () => {
    const user = userEvent.setup();

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'History' }));
    expect(screen.getByText('Edit Carry History')).toBeInTheDocument();
  });

  it('opens delete confirmation and deletes the item', async () => {
    const user = userEvent.setup();

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Delete tracker' }));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    await waitFor(() => {
      expect(deleteCarryItem).toHaveBeenCalledWith('item-1');
    });
  });

  it('increments carry count from the item card action', async () => {
    const user = userEvent.setup();

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Increase Count' }));

    expect(updateCarryItem).toHaveBeenCalledWith('item-1', { carryCount: 5 });
  });
});
