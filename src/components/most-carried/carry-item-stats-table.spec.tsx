import { describe, expect, it } from 'vitest';

import { CarryItemStatsTable } from './carry-item-stats-table.tsx';
import { renderWithContext, screen, within } from '../../test/render-with-context.tsx';

describe('CarryItemStatsTable', () => {
  it('sorts rows by carry count and renders summary totals', () => {
    renderWithContext(
      <CarryItemStatsTable
        data={[
          { id: 'item-1', name: 'Knife', value: 2, color: 'blue', cost: 100 },
          { id: 'item-2', name: 'Light', value: 5, color: 'green' }
        ]}
      />
    );

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Light')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Knife')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Summary')).toBeInTheDocument();
    expect(screen.getAllByText('$100')).toHaveLength(2);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
