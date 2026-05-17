import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

import { useCarryItems, type CreateCarryItem } from './use-carry-items.ts';
import { carryDb } from '../db/db.ts';
import { renderHook, waitFor, act } from '../test/render-with-context.tsx';

const baseItem = (
  overrides: Partial<CreateCarryItem> = {}
): CreateCarryItem => ({
  name: 'Knife',
  carryCount: 1,
  createdAt: '2026-01-10T12:00:00.000Z',
  color: 'blue',
  cost: 50,
  customFields: [{ name: 'Brand', value: 'Benchmade' }],
  ...overrides
});

describe('useCarryItems', () => {
  it('creates an item and returns it from the live query', async () => {
    const file = new File(['blade'], 'knife.png', { type: 'image/png' });
    file.arrayBuffer = vi.fn(() =>
      Promise.resolve(new TextEncoder().encode('blade').buffer)
    );

    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await result.current.createCarryItem(baseItem({ imageData: file }));
    });

    await waitFor(() => {
      expect(result.current.carryItems).toHaveLength(1);
    });

    expect(result.current.carryItems?.[0]).toEqual(
      expect.objectContaining({
        name: 'Knife',
        carryCount: 1,
        cost: 50,
        customFields: [{ name: 'Brand', value: 'Benchmade' }]
      })
    );
    expect(result.current.carryItems?.[0].imageData).toBeInstanceOf(File);
  });

  it('filters items by case-insensitive trimmed search', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'knife',
        name: 'Benchmade Knife',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'blue'
      },
      {
        id: 'light',
        name: 'Flashlight',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'green'
      }
    ]);

    const { result } = renderHook(() => useCarryItems({ search: '  KNIFE  ' }));

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([
        expect.objectContaining({ id: 'knife' })
      ]);
    });
  });

  it('filters items by created-at range', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'old',
        name: 'Old Item',
        carryCount: 1,
        createdAt: '2026-01-01T08:00:00.000Z',
        color: 'blue'
      },
      {
        id: 'new',
        name: 'New Item',
        carryCount: 1,
        createdAt: '2026-01-05T08:00:00.000Z',
        color: 'green'
      }
    ]);

    const { result } = renderHook(() =>
      useCarryItems({
        createdAt: [
          dayjs('2026-01-04T12:00:00.000Z').valueOf(),
          dayjs('2026-01-05T12:00:00.000Z').valueOf()
        ]
      })
    );

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([
        expect.objectContaining({ id: 'new' })
      ]);
    });
  });

  it('filters items by carry count and cost range', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'cheap',
        name: 'Cheap',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gray',
        cost: 10
      },
      {
        id: 'expensive',
        name: 'Expensive',
        carryCount: 8,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gold',
        cost: 200
      }
    ]);

    const { result } = renderHook(() =>
      useCarryItems({
        carryCount: [5, 10],
        cost: [100, 250]
      })
    );

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([
        expect.objectContaining({ id: 'expensive' })
      ]);
    });
  });

  it('filters items by custom field combinations', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'matching',
        name: 'Matching',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'blue',
        customFields: [
          { name: 'Brand', value: 'Benchmade' },
          { name: 'Type', value: 'Knife' }
        ],
        customFieldKeys: ['Brand::Benchmade', 'Type::Knife']
      },
      {
        id: 'partial',
        name: 'Partial',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'green',
        customFields: [{ name: 'Brand', value: 'Benchmade' }],
        customFieldKeys: ['Brand::Benchmade']
      }
    ]);

    const { result } = renderHook(() =>
      useCarryItems({
        customFields: {
          Brand: ['Benchmade'],
          Type: ['Knife']
        }
      })
    );

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([
        expect.objectContaining({ id: 'matching' })
      ]);
    });
  });

  it('records history when carry count changes', async () => {
    vi.setSystemTime(new Date('2026-02-01T10:00:00.000Z'));

    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue'
    });

    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await result.current.updateCarryItem('item-1', { carryCount: 2 });
    });

    await waitFor(async () => {
      await expect(carryDb.carriesOverTime.toArray()).resolves.toEqual([
        expect.objectContaining({
          carryItemId: 'item-1',
          currentCarryCount: 2,
          createdAt: '2026-02-01T10:00:00.000Z'
        })
      ]);
    });
  });

  it('does not record history when carry count is unchanged or absent', async () => {
    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue'
    });

    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await result.current.updateCarryItem('item-1', { name: 'Updated Knife' });
      await result.current.updateCarryItem('item-1', { carryCount: 1 });
    });

    await waitFor(async () => {
      await expect(carryDb.carriesOverTime.toArray()).resolves.toEqual([]);
    });
  });

  it('deletes items', async () => {
    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue'
    });

    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await result.current.deleteCarryItem('item-1');
    });

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([]);
    });
  });
});
