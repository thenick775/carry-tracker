import dayjs from 'dayjs';
import { Dexie } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb, type CarryOverTimeStorage } from '../db/db.ts';

export type ChartMode = 'day' | 'week' | 'month' | 'year';

export type CarryHistoryDraftEntry = Pick<
  CarryOverTimeStorage,
  'id' | 'createdAt' | 'currentCarryCount'
>;

const getUtcRangeForMode = (
  mode: ChartMode,
  periodLookBack: number,
  page?: number
) => {
  const now = dayjs.utc();

  const end = now.subtract(page ? page * periodLookBack + 1 : 0, mode);
  const start = end.subtract(periodLookBack, mode);

  return {
    min: start.toISOString(),
    max: end.toISOString()
  };
};

export const useCarriesOverTime = (
  mode: ChartMode = 'week',
  periodLookBack = 7,
  page?: number
) =>
  useLiveQuery(() => {
    const { min, max } = getUtcRangeForMode(mode, periodLookBack, page);

    return carryDb.carriesOverTime
      .where('createdAt')
      .between(min, max, true, true)
      .toArray();
  }, [mode, page, periodLookBack]);

export const useCarryHistory = (carryItemId: string) => {
  const carryHistory = useLiveQuery(
    async () =>
      await carryDb.carriesOverTime
        .where('[carryItemId+createdAt]')
        .between(
          [carryItemId, Dexie.minKey],
          [carryItemId, Dexie.maxKey],
          true,
          true
        )
        .sortBy('createdAt'),
    [carryItemId]
  );

  const saveCarryHistory = async (entries: CarryHistoryDraftEntry[]) => {
    const normalizedEntries = entries
      .map((entry) => ({
        id: entry.id,
        carryItemId,
        createdAt: dayjs(entry.createdAt).toISOString(),
        currentCarryCount: entry.currentCarryCount
      }))
      .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));

    const existingIds = await carryDb.carriesOverTime
      .where('carryItemId')
      .equals(carryItemId)
      .primaryKeys();
    const nextIds = new Set(normalizedEntries.map(({ id }) => id));
    const deletedIds = existingIds.filter((id) => !nextIds.has(id));
    const latestCarryCount = normalizedEntries.at(-1)?.currentCarryCount ?? 0;

    await carryDb.transaction(
      'rw',
      carryDb.carriesOverTime,
      carryDb.carryItems,
      async () => {
        if (deletedIds.length > 0) {
          await carryDb.carriesOverTime.bulkDelete(deletedIds);
        }

        await carryDb.carriesOverTime.bulkPut(normalizedEntries);
        await carryDb.carryItems.update(carryItemId, {
          carryCount: latestCarryCount
        });
      }
    );
  };

  return {
    carryHistory,
    totalCarryHistoryEntries: carryHistory?.length ?? 0,
    firstRecordedAt: carryHistory?.[0]?.createdAt,
    lastRecordedAt: carryHistory?.at(-1)?.createdAt,
    saveCarryHistory
  };
};
