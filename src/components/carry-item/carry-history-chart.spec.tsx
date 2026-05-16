import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CarryHistoryChart } from './carry-history-chart.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';

describe('CarryHistoryChart', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 400, height: 300 })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an empty-state message when there are no valid entries', () => {
    renderWithContext(
      <CarryHistoryChart
        entries={[{ id: 'bad', createdAt: 'nope', currentCarryCount: 1 }]}
        color="blue"
      />
    );

    expect(screen.getByText('At least one history entry is required.')).toBeInTheDocument();
  });

  it('renders chart content when valid history entries exist', () => {
    renderWithContext(
      <div style={{ width: 400, height: 300 }}>
        <CarryHistoryChart
          entries={[
            { id: 'b', createdAt: '2026-01-02T00:00:00.000Z', currentCarryCount: 4 },
            { id: 'a', createdAt: '2026-01-01T00:00:00.000Z', currentCarryCount: 1 }
          ]}
          color="blue"
        />
      </div>
    );

    expect(screen.queryByText('At least one history entry is required.')).not.toBeInTheDocument();
  });
});
