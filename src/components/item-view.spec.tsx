import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ItemsView } from './item-view.tsx';
import * as carryItemFilterOptionHooks from '../hooks/use-carry-item-filter-options.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import {
  renderWithContext,
  screen,
  waitFor
} from '../test/render-with-context.tsx';

describe('<ItemsView />', () => {
  beforeEach(() => {
    vi.spyOn(
      carryItemFilterOptionHooks,
      'useCarryItemFilterOptions'
    ).mockReturnValue({
      customFieldOptions: {},
      customFieldsValueMap: {}
    });
  });

  it('renders the empty state with no data', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    expect(screen.getByText('Your item list is empty')).toBeInTheDocument();
  });

  it('renders item cards from the hook', async () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 4,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue'
        },
        {
          id: 'item-2',
          name: 'Knife2',
          carryCount: 4,
          createdAt: '2026-01-02T00:00:00.000Z',
          color: 'blue'
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    expect(screen.getByText('Knife')).toBeInTheDocument();
    expect(screen.getByText('Knife2')).toBeInTheDocument();
    expect(screen.getByText('Carry Items:')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Knife')).toBeVisible();
    });
    expect(screen.getByText('Knife2')).toBeVisible();
  });

  it('opens create flow from the add button', async () => {
    const user = userEvent.setup();

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(screen.getByText('Create Carry Item')).toBeVisible();
  });

  it('opens the history modal from the item card', async () => {
    const user = userEvent.setup();
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
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'History' }));
    expect(screen.getByText('Edit Carry History')).toBeVisible();
  });

  it('opens delete confirmation and deletes the item', async () => {
    const user = userEvent.setup();
    const deleteCarryItemSpy = vi.fn();
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
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: deleteCarryItemSpy
    });

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Delete tracker' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(deleteCarryItemSpy).toHaveBeenCalledWith('item-1');
    });
  });

  it('increments carry count from the item card action', async () => {
    const user = userEvent.setup();
    const updateCarryItemSpy = vi.fn();
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
      createCarryItem: vi.fn(),
      updateCarryItem: updateCarryItemSpy,
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Increase Count' }));

    expect(updateCarryItemSpy).toHaveBeenCalledWith('item-1', {
      carryCount: 5
    });
  });
});
