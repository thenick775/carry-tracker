import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CostBreakdownView } from './cost-breakdown-view.tsx';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../test/render-with-context.tsx';
import * as carryItemHooks from '../hooks/use-carry-items.ts';

describe('<CostBreakdownView />', () => {
  beforeEach(() => {
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
          carryCount: 0,
          color: 'green',
          cost: 50,
          customFields: [{ name: 'Brand', value: 'Surefire' }],
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'item-3',
          name: 'Pen',
          carryCount: 2,
          color: 'gray',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });
  });

  it('reports purchase cost, concentration, and cost coverage', async () => {
    renderWithContext(<CostBreakdownView />);

    expect(
      screen.getByRole('heading', { name: 'Cost Breakdown' })
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.getByText('Total Cost')).toBeVisible();
    });
    expect(screen.getByText('$150')).toBeVisible();
    expect(screen.getByText('Highest Cost')).toBeVisible();
    expect(screen.getByText('Top 3 Share')).toBeVisible();
    expect(screen.getByText('100%')).toBeVisible();
    expect(screen.getByText('2 of 3')).toBeVisible();
    expect(screen.getByText('1 missing cost')).toBeVisible();
  });

  it('withholds dashboard content while carry items load', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: undefined,
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<CostBreakdownView />);

    expect(
      screen.getByRole('heading', { name: 'Cost Breakdown' })
    ).toBeVisible();
    expect(
      screen.queryByText('Recorded purchase cost')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('0 of 0')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Items' })
    ).not.toBeInTheDocument();
  });

  it('groups recorded purchase cost by a custom field', async () => {
    const user = userEvent.setup();
    renderWithContext(<CostBreakdownView />);

    await user.click(screen.getByRole('checkbox', { name: 'Brand' }));

    expect(
      screen.getByText('Ranked by recorded purchase cost for Brand')
    ).toBeVisible();
    expect(screen.getAllByText('Benchmade')).toHaveLength(2);
    expect(screen.getByText('Surefire')).toBeVisible();
  });

  it('warns from multi-value field data, even when the item has no cost', async () => {
    const user = userEvent.setup();
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 0,
          color: 'blue',
          customFields: [
            { name: 'Steel', value: 'M390' },
            { name: 'Steel', value: '20CV' }
          ],
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<CostBreakdownView />);
    await user.click(screen.getByRole('checkbox', { name: 'Steel' }));

    expect(
      screen.getByText(
        'Items with multiple Steel values are included in each matching group.'
      )
    ).toBeVisible();
  });

  it('explains how to begin when no item has a cost', () => {
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<CostBreakdownView />);

    expect(
      screen.getAllByText(
        'Add costs to items to see how your purchase cost is allocated.'
      )
    ).not.toHaveLength(0);
  });
});
