import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarryStatsView } from './carry-stats-view.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';
import * as carriesOverTimeHooks from '../hooks/use-carries-over-time.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';

describe('<CarryStatsView/ >', () => {
  beforeEach(() => {
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([]);
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 5,
          color: 'blue',
          cost: 100,
          customFields: [{ name: 'Brand', value: 'Benchmade' }],
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-2',
          name: 'Light',
          carryCount: 2,
          color: 'green',
          cost: 50,
          customFields: [{ name: 'Brand', value: 'Surefire' }],
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });
  });

  it('renders an empty summary while items are unavailable', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: undefined,
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });

    renderWithContext(<CarryStatsView />);

    expect(screen.getByRole('table')).toBeVisible();
    expect(screen.getByText('Summary')).toBeVisible();
    expect(
      screen.queryByRole('checkbox', { name: 'Brand' })
    ).not.toBeInTheDocument();
  });

  it('renders the items chart by default', () => {
    renderWithContext(<CarryStatsView />);

    expect(screen.getByText('Carry Stats:')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('keeps items without custom fields in the item summary', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Flashlight',
          carryCount: 2,
          color: 'green',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });

    renderWithContext(<CarryStatsView />);

    expect(screen.getByText('Flashlight')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Brand' })
    ).not.toBeInTheDocument();
  });

  it('switches to items over time and opens the series picker', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Items over time' }));
    expect(screen.getByText('Series (2)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Series (2)' }));
    expect(screen.getByText('Choose plotted series')).toBeInTheDocument();
  });

  it('returns to items after viewing items over time', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    const itemsChip = screen.getByRole('checkbox', { name: 'Items' });
    const itemsOverTimeChip = screen.getByRole('checkbox', {
      name: 'Items over time'
    });

    await user.click(itemsOverTimeChip);

    expect(screen.getByText('Series (2)')).toBeVisible();

    await user.click(itemsChip);

    expect(itemsChip).toBeChecked();
    expect(itemsOverTimeChip).not.toBeChecked();
    expect(screen.queryByText('Series (2)')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeVisible();
  });

  it('clears and restores all selected series', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Items over time' }));
    await user.click(screen.getByRole('button', { name: 'Series (2)' }));
    await user.click(screen.getByRole('button', { name: 'Hide all' }));

    expect(screen.getByText('Series (0)')).toBeVisible();
    expect(
      screen.getByText('Choose at least one series to plot.')
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Show all' }));

    expect(screen.getByText('Series (2)')).toBeVisible();
    expect(
      screen.queryByText('Choose at least one series to plot.')
    ).not.toBeInTheDocument();
  });

  it('toggles an individual selected series', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Items over time' }));
    await user.click(screen.getByRole('button', { name: 'Series (2)' }));
    await user.click(screen.getByRole('button', { name: 'Knife On' }));

    expect(screen.getByText('Series (1)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Knife Off' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Knife Off' }));

    expect(screen.getByText('Series (2)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Knife On' })).toBeVisible();
  });

  it('selects the five highest-count series', async () => {
    const user = userEvent.setup();
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 6,
          color: 'blue',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-2',
          name: 'Light',
          carryCount: 5,
          color: 'green',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-3',
          name: 'Wallet',
          carryCount: 4,
          color: 'brown',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-4',
          name: 'Pen',
          carryCount: 3,
          color: 'gray',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-5',
          name: 'Watch',
          carryCount: 2,
          color: 'black',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-6',
          name: 'Key',
          carryCount: 1,
          color: 'yellow',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      createCarryItem: () => Promise.resolve(),
      updateCarryItem: () => Promise.resolve(),
      deleteCarryItem: () => Promise.resolve()
    });

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Items over time' }));
    await user.click(screen.getByRole('button', { name: 'Series (6)' }));
    await user.click(screen.getByRole('button', { name: 'Show top 5' }));

    expect(screen.getByText('Series (5)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Knife On' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Light On' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Wallet On' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pen On' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Watch On' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Key Off' })).toBeVisible();
  });

  it('switches to a custom field view', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Brand' }));

    expect(screen.getByRole('table')).toBeVisible();
    expect(screen.getByText('Benchmade')).toBeVisible();
    expect(screen.getByText('Surefire')).toBeVisible();
  });

  it('returns to item grouping when a custom field is deselected', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    const brandChip = screen.getByRole('checkbox', { name: 'Brand' });
    await user.click(brandChip);

    expect(brandChip).toBeChecked();

    await user.click(brandChip);

    expect(brandChip).not.toBeChecked();
    expect(screen.getByText('Knife')).toBeVisible();
    expect(screen.getByText('Light')).toBeVisible();
    expect(screen.queryByText('Benchmade')).not.toBeInTheDocument();
  });
});
