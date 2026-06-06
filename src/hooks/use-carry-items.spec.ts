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

  it('creates an item without persisting an image when none is provided', async () => {
    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await result.current.createCarryItem(baseItem({ imageData: undefined }));
    });

    await waitFor(async () => {
      const stored = await carryDb.carryItems.toArray();

      expect(stored).toHaveLength(1);
      expect(stored[0]?.image).toBeUndefined();
    });
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

  it('returns items in descending created-at order with no filters', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'old',
        name: 'Old',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gray'
      },
      {
        id: 'new',
        name: 'New',
        carryCount: 2,
        createdAt: '2026-01-05T00:00:00.000Z',
        color: 'gold'
      }
    ]);

    const { result } = renderHook(() => useCarryItems());

    await waitFor(() => {
      expect(result.current.carryItems?.map((item) => item.id)).toEqual([
        'new',
        'old'
      ]);
    });
  });

  it('filters items by carry count range', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'low-count',
        name: 'Low count',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gray',
        cost: 200
      },
      {
        id: 'high-count',
        name: 'High count',
        carryCount: 8,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gold',
        cost: 10
      }
    ]);

    const { result } = renderHook(() =>
      useCarryItems({
        carryCount: [5, 10]
      })
    );

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([
        expect.objectContaining({ id: 'high-count' })
      ]);
    });
  });

  it('filters items by cost range', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'cheap',
        name: 'Cheap',
        carryCount: 8,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gray',
        cost: 10
      },
      {
        id: 'expensive',
        name: 'Expensive',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'gold',
        cost: 200
      }
    ]);

    const { result } = renderHook(() =>
      useCarryItems({
        cost: [100, 250]
      })
    );

    await waitFor(() => {
      expect(result.current.carryItems).toEqual([
        expect.objectContaining({ id: 'expensive' })
      ]);
    });
  });

  it('filters items with multiple filter conditions', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'cheap',
        name: 'Cheap',
        carryCount: 8,
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
      },
      {
        id: 'wrong-count',
        name: 'Wrong count',
        carryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        color: 'blue',
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

  it('updates regular fields, image data, and custom field keys together', async () => {
    const imageData = new File(['updated-image'], 'updated.png', {
      type: 'image/png'
    });

    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue',
      customFields: [{ name: 'Brand', value: 'Benchmade' }],
      customFieldKeys: ['Brand::Benchmade']
    });

    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await result.current.updateCarryItem('item-1', {
        name: 'Updated Knife',
        imageData,
        customFields: [
          { name: 'Brand', value: 'Spyderco' },
          { name: 'Steel', value: 'Magnacut' }
        ]
      });
    });

    await waitFor(async () => {
      const stored = await carryDb.carryItems.get('item-1');

      expect(stored).toBeDefined();
      expect(stored?.id).toBe('item-1');
      expect(stored?.name).toBe('Updated Knife');
      expect(stored?.customFields).toEqual([
        { name: 'Brand', value: 'Spyderco' },
        { name: 'Steel', value: 'Magnacut' }
      ]);
      expect(stored?.customFieldKeys).toEqual([
        'Brand::Spyderco',
        'Steel::Magnacut'
      ]);
      expect(stored?.image?.name).toBe('updated.png');
      expect(stored?.image?.mimeType).toBe('image/png');
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

  it('ignores carry count updates for missing items', async () => {
    const { result } = renderHook(() => useCarryItems());

    await act(async () => {
      await expect(
        result.current.updateCarryItem('missing-id', { carryCount: 2 })
      ).resolves.toBeUndefined();
    });

    await waitFor(async () => {
      await expect(carryDb.carryItems.get('missing-id')).resolves.toBeUndefined();
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
