import { Dexie, type Table } from 'dexie';
import { exportDB, importInto } from 'dexie-export-import';

export type CustomField = {
  name: string;
  value: string;
};

export type CustomFields = CustomField[];

export type CarryOverTimeStorage = {
  id: string;
  carryItemId: string;
  currentCarryCount: number;
  createdAt: string;
};

export type CarryItemStorage = {
  id: string;
  name: string;
  carryCount: number;
  createdAt: string;
  color: string;
  cost?: number;
  image?: {
    name: string;
    mimeType: string;
    data: Uint8Array;
  };
  customFields?: CustomFields;
  customFieldKeys?: string[];
  lastCarriedAt?: string;
};

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export type RotationStorage = {
  id: string;
  name: string;
  createdAt: string;
  // 0/1 instead of boolean so this value can be indexed, see: https://dexie.org/docs/Indexable-Type
  active: 0 | 1;
  activeAt?: string;
  orderedCarryItemIds: string[];
  stepDuration: {
    duration: number;
    unit: TimeUnit;
  };
};

export const carryDb = new Dexie('carry-db') as Dexie & {
  carryItems: Table<CarryItemStorage, string>;
  rotations: Table<RotationStorage, string>;
  carriesOverTime: Table<CarryOverTimeStorage, string>;
};

export const exportDb = async () =>
  await exportDB(carryDb, { numRowsPerChunk: 2 });

export const importDb = async (blob: Blob) =>
  await importInto(carryDb, blob, {
    acceptVersionDiff: true,
    clearTablesBeforeImport: true
  });

carryDb.version(1).stores({
  carryItems: 'id, createdAt, name',
  rotations: 'id, createdAt, name, active'
});

carryDb.version(2).stores({
  carryItems: 'id, createdAt, name, *customFields.name, *customFields.value'
});

carryDb.version(3).stores({
  carriesOverTime:
    'id, carryItemId, createdAt, currentCarryCount, [carryItemId+createdAt]'
});

carryDb
  .version(4)
  .stores({
    carryItems:
      'id, createdAt, name, carryCount, cost, *customFields.name, *customFields.value, *customFieldKeys'
  })
  .upgrade(async (tx) => {
    await tx
      .table('carryItems')
      .toCollection()
      .modify((carryItem: CarryItemStorage) => {
        carryItem.customFieldKeys = (carryItem.customFields ?? []).map(
          ({ name, value }) => `${name}::${value}`
        );
      });
  });

carryDb
  .version(5)
  .stores({
    carryItems:
      'id, createdAt, name, carryCount, cost, lastCarriedAt, *customFields.name, *customFields.value, *customFieldKeys'
  })
  .upgrade(async (tx) => {
    const carryItems = tx.table<CarryItemStorage, string>('carryItems');
    const carriesOverTime = tx.table<CarryOverTimeStorage, string>(
      'carriesOverTime'
    );

    const items = await carryItems.toArray();

    await Promise.all(
      items.map(async (carryItem) => {
        const latestCarry = await carriesOverTime
          .where('[carryItemId+createdAt]')
          .between(
            [carryItem.id, Dexie.minKey],
            [carryItem.id, Dexie.maxKey],
            true,
            true
          )
          .reverse()
          .first();

        if (!latestCarry?.createdAt) {
          return;
        }

        await carryItems.update(carryItem.id, {
          lastCarriedAt: latestCarry.createdAt
        });
      })
    );
  });
