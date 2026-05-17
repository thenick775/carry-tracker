import { describe, expect, it, vi } from 'vitest';

import { TimelineView } from './timeline-view.tsx';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as rotationHooks from '../hooks/use-rotations.ts';
import { renderWithContext, screen } from '../test/render-with-context.tsx';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, start: 0 },
      { index: 1, start: 100 }
    ],
    getTotalSize: () => 200,
    scrollToIndex: () => undefined,
    measureElement: () => undefined
  })
}));

describe('<TimelineView />', () => {
  it('shows the empty timeline state when there is no active timeline start', () => {
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue([]);
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<TimelineView />);

    expect(
      screen.getByText('Your rotation timeline is empty')
    ).toBeInTheDocument();
  });

  it('renders scheduled timeline entries for active rotations', () => {
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue([
      {
        id: 'rotation-1',
        name: 'Weekday',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        activeAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        orderedCarryItemIds: ['item-1', 'item-2'],
        stepDuration: { duration: 1, unit: 'day' }
      }
    ]);
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue'
        },
        {
          id: 'item-2',
          name: 'Light',
          carryCount: 0,
          createdAt: '2026-01-02T00:00:00.000Z',
          color: 'green'
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<TimelineView />);

    expect(screen.getByText('Knife')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getAllByText('Weekday')).toHaveLength(2);
  });
});
