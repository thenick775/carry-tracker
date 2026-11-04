import { describe, expect, it } from 'vitest';

import { useActiveRotations, useRotations } from './use-rotations.ts';
import { carryDb } from '../db/db.ts';
import { renderHook, waitFor, act } from '../test/render-with-context.tsx';

describe('useRotations', () => {
  it('creates, reads, and deletes rotations', async () => {
    const { result } = renderHook(() => useRotations());

    await act(async () => {
      await result.current.createRotation({
        name: 'Weekday',
        createdAt: '2026-01-01T00:00:00.000Z',
        active: true,
        activeAt: '2026-01-02T00:00:00.000Z',
        orderedCarryItemIds: ['item-1'],
        stepDuration: { duration: 1, unit: 'day' }
      });
    });

    await waitFor(() => {
      expect(result.current.rotations).toEqual([
        expect.objectContaining({
          name: 'Weekday',
          active: true,
          orderedCarryItemIds: ['item-1']
        })
      ]);
    });

    const rotationId = result.current.rotations?.[0].id ?? '';
    expect(rotationId).toBeTruthy();
    expect(result.current.rotations?.[0].name).toBe('Weekday');
    await expect(carryDb.rotations.get(rotationId)).resolves.toEqual(
      expect.objectContaining({ active: 1 })
    );

    await act(async () => {
      await result.current.deleteRotation(rotationId);
    });

    await waitFor(() => {
      expect(result.current.rotations).toEqual([]);
    });
  });

  it('creates inactive rotations', async () => {
    const { result } = renderHook(() => useRotations());

    await act(async () => {
      await result.current.createRotation({
        name: 'Inactive',
        createdAt: '2026-01-01T00:00:00.000Z',
        active: false,
        orderedCarryItemIds: [],
        stepDuration: { duration: 1, unit: 'day' }
      });
    });

    await waitFor(() => {
      expect(result.current.rotations).toEqual([
        expect.objectContaining({ name: 'Inactive', active: false })
      ]);
    });
  });

  it('keeps a rotation active when updating unrelated fields', async () => {
    await carryDb.rotations.add({
      id: 'rotation-1',
      name: 'Weekday',
      createdAt: '2026-01-01T00:00:00.000Z',
      active: 1,
      activeAt: '2026-01-02T00:00:00.000Z',
      orderedCarryItemIds: ['item-1'],
      stepDuration: { duration: 1, unit: 'day' }
    });

    const { result } = renderHook(() => useRotations());

    await act(async () => {
      await result.current.updateRotation('rotation-1', {
        name: 'Updated Name'
      });
    });

    await expect(carryDb.rotations.get('rotation-1')).resolves.toEqual(
      expect.objectContaining({
        name: 'Updated Name',
        active: 1
      })
    );
  });

  it('updates a rotations active state', async () => {
    await carryDb.rotations.add({
      id: 'rotation-1',
      name: 'Weekday',
      createdAt: '2026-01-01T00:00:00.000Z',
      active: 0,
      orderedCarryItemIds: ['item-1'],
      stepDuration: { duration: 1, unit: 'day' }
    });

    const { result } = renderHook(() => useRotations());

    await act(async () => {
      await result.current.updateRotation('rotation-1', { active: true });
    });

    await expect(carryDb.rotations.get('rotation-1')).resolves.toEqual(
      expect.objectContaining({ active: 1 })
    );

    await act(async () => {
      await result.current.updateRotation('rotation-1', { active: false });
    });

    await expect(carryDb.rotations.get('rotation-1')).resolves.toEqual(
      expect.objectContaining({ active: 0 })
    );
  });
});

describe('useActiveRotations', () => {
  it('returns only active rotations', async () => {
    await carryDb.rotations.bulkAdd([
      {
        id: 'inactive',
        name: 'Inactive',
        createdAt: '2026-01-01T00:00:00.000Z',
        active: 0,
        orderedCarryItemIds: [],
        stepDuration: { duration: 1, unit: 'day' }
      },
      {
        id: 'active',
        name: 'Active',
        createdAt: '2026-01-02T00:00:00.000Z',
        active: 1,
        activeAt: '2026-01-02T00:00:00.000Z',
        orderedCarryItemIds: [],
        stepDuration: { duration: 1, unit: 'day' }
      }
    ]);

    const { result } = renderHook(() => useActiveRotations());

    await waitFor(() => {
      expect(result.current).toEqual([
        expect.objectContaining({ id: 'active', active: true })
      ]);
    });
  });
});
