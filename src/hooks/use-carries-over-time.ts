import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb } from '../db/db.ts';

export type ChartMode = 'day' | 'week' | 'month' | 'year';

const getUtcRangeForMode = (mode: ChartMode, periodLookBack: number) => {
  const now = dayjs.utc();

  const unit =
    mode === 'day'
      ? 'day'
      : mode === 'week'
      ? 'week'
      : mode === 'month'
      ? 'month'
      : 'year';

  const end = now.startOf(unit);
  const start = end.subtract(periodLookBack - 1, unit);

  return {
    min: start.toISOString(),
    max: now.toISOString()
  };
};

export const useCarriesOverTime = (
  mode: ChartMode = 'week',
  periodLookBack = 7
) =>
  useLiveQuery(() => {
    const { min, max } = getUtcRangeForMode(mode, periodLookBack);

    return carryDb.carriesOverTime
      .where('createdAt')
      .between(min, max, true, true)
      .toArray();
  }, [mode]);
