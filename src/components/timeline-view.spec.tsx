import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TimelineView } from './timeline-view.tsx';
import { renderWithContext, screen } from '../../test/render-with-context.tsx';
import * as carryItemHooks from '../hooks/use-carry-items.ts';
import * as rotationHooks from '../hooks/use-rotations.ts';

type TimelineVirtualizerOptions = {
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  measureElement: (
    element: HTMLElement,
    entry: unknown,
    instance: {
      scrollDirection: 'backward' | 'forward' | null;
      measurementsCache: { size: number }[];
    }
  ) => number;
};

const virtualizerMocks = vi.hoisted(() => ({
  useVirtualizer: vi.fn<(options: TimelineVirtualizerOptions) => unknown>()
}));

vi.mock('@tanstack/react-virtual', () => virtualizerMocks);

describe('<TimelineView />', () => {
  beforeEach(() => {
    virtualizerMocks.useVirtualizer.mockReturnValue({
      getVirtualItems: () => [
        { index: 0, start: 0 },
        { index: 1, start: 100 }
      ],
      getTotalSize: () => 200,
      scrollToIndex: () => undefined,
      measureElement: () => undefined
    });
  });

  it('waits for timeline data before rendering an empty state', () => {
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue(undefined);
    vi.spyOn(carryItemHooks, 'useCarryItems').mockReturnValue({
      carryItems: undefined,
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<TimelineView />);

    expect(
      screen.queryByText('Your rotation timeline is empty')
    ).not.toBeInTheDocument();
  });

  it('renders the empty state with no data', () => {
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

  it('omits rotations before they begin and on skipped days', () => {
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue([
      {
        id: 'every-other-day',
        name: 'Every Other Day',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        activeAt: '2026-01-01T00:00:00.000Z',
        orderedCarryItemIds: ['item-1'],
        stepDuration: { duration: 2, unit: 'day' }
      },
      {
        id: 'starts-tomorrow',
        name: 'Starts Tomorrow',
        active: true,
        createdAt: '2026-01-02T00:00:00.000Z',
        activeAt: '2026-01-02T00:00:00.000Z',
        orderedCarryItemIds: ['item-2'],
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

    expect(screen.getAllByText('Knife')).toHaveLength(1);
    expect(screen.getAllByText('Light')).toHaveLength(1);
  });

  it('orders same-day entries and renders past and future days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue([
      {
        id: 'late',
        name: 'Late',
        active: true,
        createdAt: '2026-01-01T16:00:00.000Z',
        activeAt: '2026-01-01T16:00:00.000Z',
        orderedCarryItemIds: ['item-2'],
        stepDuration: { duration: 1, unit: 'day' }
      },
      {
        id: 'early',
        name: 'Early',
        active: true,
        createdAt: '2026-01-01T08:00:00.000Z',
        activeAt: '2026-01-01T08:00:00.000Z',
        orderedCarryItemIds: ['item-1'],
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
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'green'
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<TimelineView />);

    const early = screen.getAllByText('Early')[0];
    const late = screen.getAllByText('Late')[0];
    expect(early.compareDocumentPosition(late)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    vi.useRealTimers();
  });

  it('configures virtualizer sizing and measurement for scroll direction', () => {
    vi.spyOn(rotationHooks, 'useActiveRotations').mockReturnValue([
      {
        id: 'rotation-1',
        name: 'Weekday',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        activeAt: '2026-01-01T00:00:00.000Z',
        orderedCarryItemIds: ['item-1'],
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
        }
      ],
      createCarryItem: vi.fn(),
      updateCarryItem: vi.fn(),
      deleteCarryItem: vi.fn()
    });

    renderWithContext(<TimelineView />);

    const options = virtualizerMocks.useVirtualizer.mock.lastCall?.[0];
    expect(options).toBeDefined();

    const element = document.createElement('div');
    element.setAttribute('data-index', '1');
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      height: 48
    } as DOMRect);

    expect(options?.getScrollElement()).toBeInstanceOf(HTMLElement);
    expect(options?.estimateSize(0)).toBe(78);
    expect(
      options?.measureElement(element, undefined, {
        scrollDirection: 'forward',
        measurementsCache: []
      })
    ).toBe(48);
    expect(
      options?.measureElement(element, undefined, {
        scrollDirection: null,
        measurementsCache: []
      })
    ).toBe(48);
    expect(
      options?.measureElement(element, undefined, {
        scrollDirection: 'backward',
        measurementsCache: [{ size: 0 }, { size: 32 }]
      })
    ).toBe(32);
    expect(
      options?.measureElement(element, undefined, {
        scrollDirection: 'backward',
        measurementsCache: []
      })
    ).toBe(48);
  });
});
