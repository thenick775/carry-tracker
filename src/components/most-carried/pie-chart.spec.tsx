import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PieChart } from './pie-chart.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('PieChart', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 400, height: 400 })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('filters out zero-value series before rendering', () => {
    renderWithContext(
      <div style={{ width: 400, height: 400 }}>
        <PieChart
          data={[
            { name: 'Knife', value: 5, color: 'blue' },
            { name: 'Light', value: 0, color: 'green' }
          ]}
        />
      </div>
    );

    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
