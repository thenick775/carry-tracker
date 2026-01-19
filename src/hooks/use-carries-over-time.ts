import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb } from '../db/db.ts';

export type ChartMode = 'day' | 'week' | 'month' | 'year';

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
