import { carryDb } from '../db/db.ts';

export const resetDb = async () => {
  if (!carryDb.isOpen()) {
    await carryDb.open();
  }

  await carryDb.transaction(
    'rw',
    carryDb.carryItems,
    carryDb.rotations,
    carryDb.carriesOverTime,
    async () => {
      await carryDb.carryItems.clear();
      await carryDb.rotations.clear();
      await carryDb.carriesOverTime.clear();
    }
  );
};
