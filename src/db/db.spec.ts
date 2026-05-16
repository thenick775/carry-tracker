import { beforeEach, describe, expect, it } from 'vitest';

import { carryDb, exportDb, importDb } from './db.ts';
import { resetDb } from '../test/db.ts';

describe('db', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('exports and imports items, rotations, and carry history', async () => {
    await carryDb.carryItems.add({
      id: 'item-1',
      name: 'Knife',
      carryCount: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'blue',
      cost: 120,
      customFields: [{ name: 'Brand', value: 'Benchmade' }],
      customFieldKeys: ['Brand::Benchmade']
    });
    await carryDb.rotations.add({
      id: 'rotation-1',
      name: 'Weekday',
      createdAt: '2026-01-01T00:00:00.000Z',
      active: 1,
      activeAt: '2026-01-02T00:00:00.000Z',
      orderedCarryItemIds: ['item-1'],
      stepDuration: { duration: 1, unit: 'day' }
    });
    await carryDb.carriesOverTime.add({
      id: 'history-1',
      carryItemId: 'item-1',
      currentCarryCount: 3,
      createdAt: '2026-01-03T00:00:00.000Z'
    });

    const exported = await exportDb();

    await resetDb();
    await importDb(exported);

    await expect(carryDb.carryItems.toArray()).resolves.toEqual([
      expect.objectContaining({
        id: 'item-1',
        name: 'Knife',
        carryCount: 3,
        customFieldKeys: ['Brand::Benchmade']
      })
    ]);
    await expect(carryDb.rotations.toArray()).resolves.toEqual([
      expect.objectContaining({
        id: 'rotation-1',
        active: 1,
        orderedCarryItemIds: ['item-1']
      })
    ]);
    await expect(carryDb.carriesOverTime.toArray()).resolves.toEqual([
      expect.objectContaining({
        id: 'history-1',
        carryItemId: 'item-1',
        currentCarryCount: 3
      })
    ]);
  });

  it('clears existing tables before import', async () => {
    await resetDb();
    await carryDb.carryItems.put({
      id: 'new-item',
      name: 'New',
      carryCount: 5,
      createdAt: '2026-01-02T00:00:00.000Z',
      color: 'green'
    });
    const exported = await exportDb();

    await resetDb();

    await carryDb.carryItems.add({
      id: 'old-item',
      name: 'Old',
      carryCount: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      color: 'red'
    });

    await importDb(exported);

    await expect(carryDb.carryItems.toArray()).resolves.toEqual([
      expect.objectContaining({ id: 'new-item', name: 'New' })
    ]);
  });
});
