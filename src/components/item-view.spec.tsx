import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ItemsView } from './item-view.tsx';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../test/render-with-context.tsx';
import * as carryItemFilterOptionHooks from '../hooks/use-carry-item-filter-options.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';

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

  it('filters and clears items from the search input', async () => {
    const user = userEvent.setup();
    const knifeItems = [
      {
        id: 'item-1',
        name: 'Knife',
        carryCount: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'blue'
      }
    ];
    const lightItems = [
      {
        id: 'item-2',
        name: 'Light',
        carryCount: 2,
        createdAt: '2026-01-02T00:00:00.000Z',
        color: 'yellow'
      }
    ];

    vi.spyOn(carryItemHooks, 'useCarryItems').mockImplementation(
      (filters = {}) => ({
        carryItems: filters.search === 'knife' ? knifeItems : lightItems,
        createCarryItem: vi.fn(),
        updateCarryItem: vi.fn(),
        deleteCarryItem: vi.fn()
      })
    );

    renderWithContext(<ItemsView />);

    await waitFor(() => expect(screen.getByText('Light')).toBeVisible());

    await user.type(screen.getByPlaceholderText('Search by name'), 'knife');

    await waitFor(() => expect(screen.getByText('Knife')).toBeVisible());
    expect(screen.queryByText('Light')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    await waitFor(() => expect(screen.getByText('Light')).toBeVisible());
    expect(screen.queryByText('Knife')).not.toBeInTheDocument();
  });

  it('filters custom fields and clears all filters', async () => {
    const user = userEvent.setup();
    const knifeItems = [
      {
        id: 'item-1',
        name: 'Knife',
        carryCount: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'blue'
      }
    ];
    const lightItems = [
      {
        id: 'item-2',
        name: 'Light',
        carryCount: 2,
        createdAt: '2026-01-02T00:00:00.000Z',
        color: 'yellow'
      }
    ];

    vi.spyOn(
      carryItemFilterOptionHooks,
      'useCarryItemFilterOptions'
    ).mockReturnValue({
      customFieldOptions: { Brand: ['Benchmade'] },
      customFieldsValueMap: { Brand: [{ name: 'Brand', value: 'Benchmade' }] }
    });
    vi.spyOn(carryItemHooks, 'useCarryItems').mockImplementation(
      (filters = {}) => ({
        carryItems: filters.customFields?.Brand.includes('Benchmade')
          ? knifeItems
          : lightItems,
        createCarryItem: vi.fn(),
        updateCarryItem: vi.fn(),
        deleteCarryItem: vi.fn()
      })
    );

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Brand' }));
    await user.click(screen.getByText('Benchmade'));

    await waitFor(() => expect(screen.getByText('Knife')).toBeVisible());
    expect(screen.getByRole('button', { name: 'Brand: 1' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Brand: 1' }));

    await waitFor(() => expect(screen.getByText('Light')).toBeVisible());

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    await waitFor(() => expect(screen.getByText('Light')).toBeVisible());
    expect(
      screen.queryByRole('button', { name: 'Brand: 1' })
    ).not.toBeInTheDocument();
  });

  it('applies range filters and removes their badges', async () => {
    const user = userEvent.setup();
    const knifeItems = [
      {
        id: 'item-1',
        name: 'Knife',
        carryCount: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'blue'
      }
    ];
    const lightItems = [
      {
        id: 'item-2',
        name: 'Light',
        carryCount: 2,
        createdAt: '2026-01-02T00:00:00.000Z',
        color: 'yellow'
      }
    ];

    vi.spyOn(
      carryItemFilterOptionHooks,
      'useCarryItemFilterOptions'
    ).mockReturnValue({
      createdAtRange: [
        new Date(2026, 0, 1).valueOf(),
        new Date(2026, 0, 10).valueOf()
      ],
      carryCountRange: [0, 10],
      costRange: [0, 100],
      customFieldOptions: {},
      customFieldsValueMap: {}
    });
    vi.spyOn(carryItemHooks, 'useCarryItems').mockImplementation((filters) => ({
      carryItems:
        filters?.createdAt || filters?.carryCount || filters?.cost
          ? knifeItems
          : lightItems,
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    }));

    renderWithContext(<ItemsView />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    const [dateThumb] = screen.getAllByRole('slider', {
      value: { min: 0, max: 9 }
    });
    const [carryCountThumb] = screen.getAllByRole('slider', {
      value: { min: 0, max: 10 }
    });
    const [costThumb] = screen.getAllByRole('slider', {
      value: { min: 0, max: 100 }
    });

    for (const thumb of [dateThumb, carryCountThumb, costThumb]) {
      await user.pointer({
        target: thumb,
        coords: { x: 20, y: 0 },
        keys: '[MouseLeft>]'
      });
      await waitFor(() => expect(thumb).not.toHaveValue(0));
      await user.pointer({ keys: '[/MouseLeft]' });
    }

    await waitFor(() => expect(screen.getByText('Knife')).toBeVisible());

    await user.click(screen.getByRole('button', { name: 'Date added' }));
    await user.click(screen.getByRole('button', { name: 'Carry count' }));
    await user.click(screen.getByRole('button', { name: 'Cost' }));

    await waitFor(() => expect(screen.getByText('Light')).toBeVisible());
  });
});
