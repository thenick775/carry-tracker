import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LineChart } from './line-chart.tsx';
import * as carriesOverTimeHooks from '../../hooks/use-carries-over-time.ts';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

const useCarriesOverTime = vi.fn<
  (
    mode?: string,
    page?: number,
    periodLookBack?: number
  ) => {
    mode?: carriesOverTimeHooks.ChartMode;
    id: string;
    carryItemId: string;
    createdAt: string;
    currentCarryCount: number;
  }[]
>();

describe('LineChart', () => {
  beforeEach(() => {
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockImplementation(
      useCarriesOverTime
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 400, height: 300 })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty selection overlay when no item ids are selected', () => {
    useCarriesOverTime.mockReturnValue([]);

    renderWithContext(
      <LineChart
        data={[{ id: 'item-1', name: 'Knife', color: 'blue' }]}
        selectedItemIds={[]}
      />
    );

    expect(
      screen.getByText('Choose at least one item to plot.')
    ).toBeInTheDocument();
  });

  it('renders chart content when selected items have carry history', () => {
    useCarriesOverTime.mockReturnValue([
      {
        id: 'history-1',
        carryItemId: 'item-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 2
      },
      {
        id: 'history-2',
        carryItemId: 'item-2',
        createdAt: '2026-01-02T00:00:00.000Z',
        currentCarryCount: 1
      }
    ]);

    renderWithContext(
      <LineChart
        data={[
          { id: 'item-1', name: 'Knife', color: 'blue' },
          { id: 'item-2', name: 'Light', color: 'green' }
        ]}
        selectedItemIds={['item-1']}
      />
    );

    expect(screen.queryByText('Choose at least one item to plot.')).not.toBeInTheDocument();
    expect(screen.getByText('Dec 28 - Dec 28')).toBeInTheDocument();
  });

  it('resets to the first page when the mode changes', async () => {
    const user = userEvent.setup();
    useCarriesOverTime.mockReturnValue([
      {
        id: 'history-1',
        carryItemId: 'item-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 2
      }
    ]);

    renderWithContext(
      <LineChart data={[{ id: 'item-1', name: 'Knife', color: 'blue' }]} />
    );

    await user.click(screen.getByRole('button', { name: 'Older period' }));
    expect(screen.getByRole('button', { name: 'Newer period' })).toBeEnabled();

    await user.click(screen.getByRole('radio', { name: 'Month' }));

    expect(screen.getByRole('button', { name: 'Newer period' })).toBeDisabled();
  });
});
