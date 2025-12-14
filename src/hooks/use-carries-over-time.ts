import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb } from '../db/db.ts';

export type ChartMode = 'week' | 'month' | 'year';

const getUtcRangeForMode = (mode: ChartMode) => {
  const now = dayjs();
  const start =
    mode === 'week'
      ? now.startOf('week')
      : mode === 'month'
      ? now.startOf('month')
      : now.startOf('year');

  return { min: start.toISOString(), max: now.toISOString() };
};

export const useCarriesOverTime = (mode: ChartMode = 'week') =>
  useLiveQuery(() => {
    const { min, max } = getUtcRangeForMode(mode);

    return carryDb.carriesOverTime
      .where('createdAt')
      .between(min, max, true, true)
      .toArray();
  }, [mode]);
