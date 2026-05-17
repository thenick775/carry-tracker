import { describe, expect, it } from 'vitest';

import { PieChart } from './pie-chart.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('<PieChart />', () => {
  it('filters out zero-value series before rendering', () => {
    renderWithContext(
      <PieChart
        data={[
          { name: 'Knife', value: 5, color: 'blue' },
          { name: 'Light', value: 0, color: 'green' },
          { name: 'Wallet', value: 7, color: 'red' }
        ]}
      />
    );

    // TODO: this test is not working properly, need to do something to better assert thsi
    // expect(await screen.findByLabelText('Knife_1')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
