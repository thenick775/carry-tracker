import { describe, expect, it } from 'vitest';

import { CarryItemStatsTable } from './carry-item-stats-table.tsx';
import {
  renderWithContext,
  screen,
  within
} from '../../test/render-with-context.tsx';

describe('<CarryItemStatsTable />', () => {
  it('sorts rows by carry count and renders summary totals', () => {
    renderWithContext(
      <CarryItemStatsTable
        data={[
          { id: 'item-1', name: 'Knife', value: 2, color: 'blue', cost: 100 },
          { id: 'item-2', name: 'Light', value: 5, color: 'green' }
        ]}
      />
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Carry Count');
    expect(headers[2]).toHaveTextContent('Cost');
    expect(headers[3]).toHaveTextContent('%');
    expect(headers[4]).toHaveTextContent('Color');

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Light')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Knife')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Summary')).toBeInTheDocument();
    expect(screen.getAllByText('$100')).toHaveLength(2);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders a summary-only table with empty data', () => {
    renderWithContext(<CarryItemStatsTable data={[]} />);

    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(2);
    expect(within(rows[1]).getByText('Summary')).toBeInTheDocument();
    expect(within(rows[1]).getByText('0')).toBeInTheDocument();
    expect(within(rows[1]).getByText('$0')).toBeInTheDocument();
  });
});
