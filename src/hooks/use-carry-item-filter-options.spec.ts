import dayjs from 'dayjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCarryItemFilterOptions } from './use-carry-item-filter-options.ts';
import { carryDb } from '../db/db.ts';
import { resetDb } from '../test/db.ts';
import { renderHook, waitFor } from '../test/render-with-context.tsx';

describe('useCarryItemFilterOptions', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('derives ranges and grouped custom field options from stored items', async () => {
    await carryDb.carryItems.bulkAdd([
      {
        id: 'item-1',
        name: 'Knife',
        carryCount: 2,
        createdAt: '2026-01-01T12:00:00.000Z',
        color: 'blue',
        cost: 100,
        customFields: [
          { name: 'Brand', value: 'Benchmade' },
          { name: 'Type', value: 'Knife' }
        ],
        customFieldKeys: ['Brand::Benchmade', 'Type::Knife']
      },
      {
        id: 'item-2',
        name: 'Light',
        carryCount: 8,
        createdAt: '2026-01-05T08:00:00.000Z',
        color: 'green',
        cost: 250,
        customFields: [
          { name: 'Brand', value: 'Surefire' },
          { name: 'Type', value: 'Light' }
        ],
        customFieldKeys: ['Brand::Surefire', 'Type::Light']
      }
    ]);

    const { result } = renderHook(() => useCarryItemFilterOptions());

    await waitFor(() => {
      expect(result.current).toEqual({
        createdAtRange: [
          dayjs('2026-01-01T12:00:00.000Z').startOf('day').valueOf(),
          dayjs('2026-01-05T08:00:00.000Z').startOf('day').valueOf()
        ],
        carryCountRange: [2, 8],
        costRange: [100, 250],
        customFieldOptions: {
          Brand: ['Benchmade', 'Surefire'],
          Type: ['Knife', 'Light']
        },
        customFieldsValueMap: {
          Brand: [
            { name: 'Brand', value: 'Benchmade' },
            { name: 'Brand', value: 'Surefire' }
          ],
          Type: [
            { name: 'Type', value: 'Knife' },
            { name: 'Type', value: 'Light' }
          ]
        }
      });
    });
  });

  it.todo(
    'keeps duplicate values under different custom field names',
    async () => {
      await carryDb.carryItems.bulkAdd([
        {
          id: 'item-1',
          name: 'Knife',
          carryCount: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'blue',
          customFields: [{ name: 'Brand', value: 'USA' }],
          customFieldKeys: ['Brand::USA']
        },
        {
          id: 'item-2',
          name: 'Light',
          carryCount: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          color: 'green',
          customFields: [{ name: 'Origin', value: 'USA' }],
          customFieldKeys: ['Origin::USA']
        }
      ]);

      const { result } = renderHook(() => useCarryItemFilterOptions());

      await waitFor(() => {
        expect(result.current?.customFieldsValueMap).toEqual({
          Brand: [{ name: 'Brand', value: 'USA' }],
          Origin: [{ name: 'Origin', value: 'USA' }]
        });
      });
    }
  );
});
