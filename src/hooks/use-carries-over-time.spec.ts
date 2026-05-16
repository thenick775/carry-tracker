import dayjs from 'dayjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCarriesOverTime, useCarryHistory } from './use-carries-over-time.ts';
import { carryDb } from '../db/db.ts';
import { resetDb } from '../test/db.ts';
import { renderHook, waitFor, act } from '../test/render-with-context.tsx';

describe('useCarriesOverTime', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns entries in the requested lookback window', async () => {
    const insideDate = dayjs().subtract(2, 'day').toISOString();
    const outsideDate = dayjs().subtract(8, 'week').toISOString();

    await carryDb.carriesOverTime.bulkAdd([
      {
        id: 'inside',
        carryItemId: 'item-1',
        currentCarryCount: 2,
        createdAt: insideDate
      },
      {
        id: 'outside',
        carryItemId: 'item-1',
        currentCarryCount: 1,
        createdAt: outsideDate
      }
    ]);

    const { result } = renderHook(() => useCarriesOverTime('week', 7));

    await waitFor(() => {
      expect(result.current).toEqual([
        expect.objectContaining({ id: 'inside' })
      ]);
    });
  });
});

describe('useCarryHistory', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns sorted carry history metadata', async () => {
    await carryDb.carriesOverTime.bulkAdd([
      {
        id: 'late',
        carryItemId: 'item-1',
        currentCarryCount: 5,
        createdAt: '2026-01-05T00:00:00.000Z'
      },
      {
        id: 'early',
        carryItemId: 'item-1',
        currentCarryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ]);

    const { result } = renderHook(() => useCarryHistory('item-1'));

    await waitFor(() => {
      expect(result.current.carryHistory?.map(({ id }) => id)).toEqual([
        'early',
        'late'
      ]);
    });

    expect(result.current.totalCarryHistoryEntries).toBe(2);
    expect(result.current.firstRecordedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.current.lastRecordedAt).toBe('2026-01-05T00:00:00.000Z');
  });

  it('saves normalized sorted history, deletes removed entries, and updates carry count', async () => {
    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue'
    });
    await carryDb.carriesOverTime.bulkAdd([
      {
        id: 'remove-me',
        carryItemId: 'item-1',
        currentCarryCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'keep-me',
        carryItemId: 'item-1',
        currentCarryCount: 2,
        createdAt: '2026-01-02T00:00:00.000Z'
      }
    ]);

    const { result } = renderHook(() => useCarryHistory('item-1'));

    await waitFor(() => {
      expect(result.current.carryHistory).toHaveLength(2);
    });

    await act(async () => {
      await result.current.saveCarryHistory([
        {
          id: 'new-2',
          createdAt: '2026-01-04T12:00:00-05:00',
          currentCarryCount: 4
        },
        {
          id: 'keep-me',
          createdAt: '2026-01-03T00:00:00.000Z',
          currentCarryCount: 3
        }
      ]);
    });

    await expect(carryDb.carriesOverTime.orderBy('createdAt').toArray()).resolves.toEqual([
      expect.objectContaining({
        id: 'keep-me',
        createdAt: '2026-01-03T00:00:00.000Z',
        currentCarryCount: 3
      }),
      expect.objectContaining({
        id: 'new-2',
        createdAt: '2026-01-04T17:00:00.000Z',
        currentCarryCount: 4
      })
    ]);
    await expect(carryDb.carryItems.get('item-1')).resolves.toEqual(
      expect.objectContaining({ carryCount: 4 })
    );
  });

  it('sets carry count to zero when saving an empty history', async () => {
    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 7,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue'
    });

    const { result } = renderHook(() => useCarryHistory('item-1'));

    await act(async () => {
      await result.current.saveCarryHistory([]);
    });

    await expect(carryDb.carryItems.get('item-1')).resolves.toEqual(
      expect.objectContaining({ carryCount: 0 })
    );
  });
});
