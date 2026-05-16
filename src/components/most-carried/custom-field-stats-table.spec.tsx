import { describe, expect, it } from 'vitest';

import { CustomFieldStatsTable } from './custom-field-stats-table.tsx';
import { renderWithContext, screen, within } from '../../test/render-with-context.tsx';

describe('CustomFieldStatsTable', () => {
  it('sorts rows by total and renders summary totals', () => {
    renderWithContext(
      <CustomFieldStatsTable
        data={[
          {
            id: 'brand-1',
            name: 'Benchmade',
            value: 2,
            carryCount: 7,
            color: 'blue',
            cost: 100
          },
          {
            id: 'brand-2',
            name: 'Surefire',
            value: 5,
            carryCount: 3,
            color: 'green'
          }
        ]}
      />
    );

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Surefire')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Benchmade')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Summary')).toBeInTheDocument();
    expect(screen.getAllByText('$100')).toHaveLength(2);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
