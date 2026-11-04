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

  it('submits updates for an existing item', async () => {
    const user = userEvent.setup();
    const updateCarryItemSpy = vi.fn();
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 4,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue',
          imageData: new File(['image'], 'knife.png', { type: 'image/png' })
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: updateCarryItemSpy,
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Updated Knife');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(updateCarryItemSpy).toHaveBeenCalledExactlyOnceWith(
      'item-1',
      expect.objectContaining({ name: 'Updated Knife' })
    );
    expect(screen.queryByText('Update Carry Item')).not.toBeInTheDocument();
  });

  it('does not show an empty state while item data is loading', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: undefined,
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    expect(
      screen.queryByText('Your item list is empty')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Carry Items:')).not.toBeInTheDocument();
  });

  it('does not show items while filter options are loading', () => {
    vi.spyOn(
      carryItemFilterOptionHooks,
      'useCarryItemFilterOptions'
    ).mockReturnValue(undefined);
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

    expect(screen.queryByText('Knife')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Your item list is empty')
    ).not.toBeInTheDocument();
  });

  it('opens create flow from the add button', async () => {
    const user = userEvent.setup();

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(screen.getByText('Create Carry Item')).toBeVisible();
  });

  it('submits a new item from the add flow', async () => {
    const user = userEvent.setup();
    const imageData = new File(['image'], 'knife.png', { type: 'image/png' });
    const createCarryItemSpy = vi.fn();
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [],
      createCarryItem: createCarryItemSpy,
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.type(screen.getByLabelText('Name'), 'Knife');
    await user.upload(screen.getByLabelText('Image file'), imageData);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(createCarryItemSpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ name: 'Knife', imageData })
    );
    expect(screen.queryByText('Create Carry Item')).not.toBeInTheDocument();
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

    expect(deleteCarryItemSpy).toHaveBeenCalledExactlyOnceWith('item-1');
  });

  it('cleans up item-specific modal state when flows close', async () => {
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

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('Update Carry Item')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByText('Create Carry Item')).toBeVisible();
    expect(screen.queryByDisplayValue('Knife')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'History' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('Edit Carry History')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Delete tracker' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Delete item')).not.toBeInTheDocument();
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

    expect(updateCarryItemSpy).toHaveBeenCalledExactlyOnceWith('item-1', {
      carryCount: 5
    });
  });
});
