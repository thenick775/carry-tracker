import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LineChart } from './line-chart.tsx';
import {
  renderWithContext,
  screen,
  waitFor
} from '../../../test/render-with-context.tsx';
import * as carriesOverTimeHooks from '../../hooks/use-carries-over-time.ts';

describe('<LineChart />', () => {
  it('renders chart content', () => {
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
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
        selectedSeriesIds={['item-1', 'item-2']}
      />
    );

    expect(
      screen.queryByText('Choose at least one series to plot.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Dec 28 - Dec 28')).toBeVisible();
    expect(screen.getAllByLabelText('line-chart-dot')).toHaveLength(2);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('shows the empty selection overlay when no item ids are selected', () => {
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([]);

    renderWithContext(
      <LineChart
        data={[{ id: 'item-1', name: 'Knife', color: 'blue' }]}
        selectedSeriesIds={[]}
      />
    );

    expect(
      screen.getByText('Choose at least one series to plot.')
    ).toBeInTheDocument();
    expect(screen.queryAllByLabelText('line-chart-dot')).toHaveLength(0);
  });

  it('renders chart content when selected items have carry history', () => {
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
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
        selectedSeriesIds={['item-1']}
      />
    );

    expect(
      screen.queryByText('Choose at least one series to plot.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Dec 28 - Dec 28')).toBeVisible();
    expect(screen.getAllByLabelText('line-chart-dot')).toHaveLength(1);
  });

  it('groups selected history by a custom field', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
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
          {
            id: 'item-1',
            name: 'Knife',
            color: 'blue',
            customFields: [{ name: 'Brand', value: 'Benchmade' }]
          },
          { id: 'item-2', name: 'Light', color: 'green' }
        ]}
        selectedSeriesIds={['Benchmade']}
        selectedTagField="Brand"
      />
    );

    expect(screen.getAllByLabelText('line-chart-dot')).toHaveLength(1);

    await user.pointer({
      target: screen.getByRole('application'),
      coords: { x: 50, y: 50 }
    });

    await waitFor(() => {
      expect(screen.getByText('Benchmade')).toBeInTheDocument();
    });
  });

  it('labels history for a deleted item as unknown', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
      {
        id: 'history-1',
        carryItemId: 'deleted-item',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 2
      }
    ]);

    renderWithContext(
      <LineChart data={[]} selectedSeriesIds={['deleted-item']} />
    );

    expect(screen.getAllByLabelText('line-chart-dot')).toHaveLength(1);

    await user.pointer({
      target: screen.getByRole('application'),
      coords: { x: 50, y: 50 }
    });

    await waitFor(() => {
      expect(screen.getByText('Unknown Item')).toBeInTheDocument();
    });
  });

  it('hides zero value series from the tooltip', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
      {
        id: 'history-1',
        carryItemId: 'item-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 2
      },
      {
        id: 'history-2',
        carryItemId: 'item-2',
        createdAt: '2026-01-08T00:00:00.000Z',
        currentCarryCount: 1
      }
    ]);

    renderWithContext(
      <LineChart
        data={[
          { id: 'item-1', name: 'Knife', color: 'blue' },
          { id: 'item-2', name: 'Light', color: 'green' }
        ]}
        selectedSeriesIds={['item-1', 'item-2']}
      />
    );

    await user.pointer({
      target: screen.getByRole('application'),
      coords: { x: 30, y: 50 }
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Knife : 1');
      expect(screen.getByRole('status')).not.toHaveTextContent('Light : 0');
    });
  });

  it.each([
    ['Day', 'Jan 1'],
    ['Month', 'January 2026'],
    ['Year', '2026']
  ])('formats the %s tooltip label', async (mode, expectedLabel) => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
      {
        id: 'history-1',
        carryItemId: 'item-1',
        createdAt: new Date(2026, 0, 1, 12).toISOString(),
        currentCarryCount: 2
      }
    ]);

    renderWithContext(
      <LineChart
        data={[{ id: 'item-1', name: 'Knife', color: 'blue' }]}
        selectedSeriesIds={['item-1']}
      />
    );

    await user.click(screen.getByRole('radio', { name: mode }));
    await user.pointer({
      target: screen.getByRole('application'),
      coords: { x: 50, y: 50 }
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(expectedLabel);
    });
  });

  it('resets to the first page when the mode changes', async () => {
    const user = userEvent.setup();
    vi.spyOn(carriesOverTimeHooks, 'useCarriesOverTime').mockReturnValue([
      {
        id: 'history-1',
        carryItemId: 'item-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        currentCarryCount: 2
      }
    ]);

    renderWithContext(
      <LineChart
        data={[{ id: 'item-1', name: 'Knife', color: 'blue' }]}
        selectedSeriesIds={['item-1']}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Older period' }));
    expect(screen.getByRole('button', { name: 'Newer period' })).toBeEnabled();

    await user.click(screen.getByRole('radio', { name: 'Month' }));

    expect(screen.getByRole('button', { name: 'Newer period' })).toBeDisabled();
  });
});
