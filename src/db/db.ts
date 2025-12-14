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
  image?: {
    name: string;
    mimeType: string;
    data: Uint8Array;
  };
  customFields?: CustomFields;
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
  await importInto(carryDb, blob, { acceptVersionDiff: true });

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
