import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarryStatsView } from './carry-stats-view.tsx';
import * as carriesOverTimeHooks from '../hooks/use-carries-over-time.ts';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import { renderWithContext, screen } from '../test/render-with-context.tsx';

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

  it('renders the items chart by default', () => {
    renderWithContext(<CarryStatsView />);

    expect(screen.getByText('Carry Stats:')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('switches to items over time and opens the series picker', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Items over time' }));
    expect(screen.getByText('Series (2)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Series \(2\)/ }));
    expect(screen.getByText('Choose plotted series')).toBeInTheDocument();
  });

  it('switches to a custom field view', async () => {
    const user = userEvent.setup();

    renderWithContext(<CarryStatsView />);

    await user.click(screen.getByRole('checkbox', { name: 'Brand' }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Benchmade')).toBeInTheDocument();
    expect(screen.getByText('Surefire')).toBeInTheDocument();
  });
});
