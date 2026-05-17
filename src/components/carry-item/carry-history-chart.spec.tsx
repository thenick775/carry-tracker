import { describe, expect, it } from 'vitest';

import { CarryHistoryChart } from './carry-history-chart.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<CarryHistoryChart />', () => {
  it('shows an empty-state message when there are no valid entries', () => {
    renderWithContext(
      <CarryHistoryChart
        entries={[{ id: 'bad', createdAt: 'nope', currentCarryCount: 1 }]}
        color="blue"
      />
    );

    expect(
      screen.getByText('At least one history entry is required.')
    ).toBeVisible();
    expect(screen.queryAllByLabelText('line-chart-dot')).toHaveLength(0);
  });

  it('renders chart content when valid history entries exist', () => {
    renderWithContext(
      <CarryHistoryChart
        entries={[
          {
            id: 'b',
            createdAt: '2026-01-02T00:00:00.000Z',
            currentCarryCount: 4
          },
          {
            id: 'a',
            createdAt: '2026-01-01T00:00:00.000Z',
            currentCarryCount: 1
          }
        ]}
        color="blue"
      />
    );

    expect(
      screen.queryByText('At least one history entry is required.')
    ).not.toBeInTheDocument();
    expect(screen.getAllByLabelText('line-chart-dot')).toHaveLength(2);
  });
});
