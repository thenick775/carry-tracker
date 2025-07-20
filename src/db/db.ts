import { Dexie, type Table } from 'dexie';
import { exportDB, importInto } from 'dexie-export-import';

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
};

export type RotationStorage = {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  activeAt?: string;
  orderedCarryItemIds: string[];
};

export const carryDb = new Dexie('carry-db') as Dexie & {
  carryItems: Table<CarryItemStorage, string>;
  rotations: Table<RotationStorage, string>;
};

export const exportDb = async () => await exportDB(carryDb);

export const importDb = async (blob: Blob) => await importInto(carryDb, blob);

carryDb.version(1).stores({
  carryItems: 'id, createdAt, name',
  rotations: 'id, createdAt, name, active'
});
