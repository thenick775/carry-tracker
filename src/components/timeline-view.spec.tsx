import { describe, expect, it, vi } from 'vitest';

import { TimelineView } from './timeline-view.tsx';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as rotationHooks from '../hooks/use-rotations.ts';
import { renderWithContext, screen } from '../test/render-with-context.tsx';

const useActiveRotations = vi.fn<() => rotationHooks.Rotation[]>();
const useCarryItems =
  vi.fn<() => ReturnType<typeof carryItemHooks.useCarryItems>>();

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [{ index: 0, start: 0 }],
    getTotalSize: () => 100,
    scrollToIndex: () => undefined,
    measureElement: () => undefined
  })
}));

describe('TimelineView', () => {
  beforeEach(() => {
    vi.spyOn(rotationHooks, 'useActiveRotations').mockImplementation(
      useActiveRotations
    );
    vi.spyOn(carryItemHooks, 'useCarryItems').mockImplementation(useCarryItems);
  });

  it('shows the empty timeline state when there is no active timeline start', () => {
    useActiveRotations.mockReturnValue([]);
    useCarryItems.mockReturnValue({
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
    useActiveRotations.mockReturnValue([
      {
        id: 'rotation-1',
        name: 'Weekday',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        activeAt: new Date().toISOString(),
        orderedCarryItemIds: ['item-1'],
        stepDuration: { duration: 1, unit: 'day' }
      }
    ]);
    useCarryItems.mockReturnValue({
      carryItems: [
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue'
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<TimelineView />);

    expect(screen.getByText('Knife')).toBeInTheDocument();
    expect(screen.getByText('Weekday')).toBeInTheDocument();
  });
});
