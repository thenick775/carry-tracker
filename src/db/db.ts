import { Dexie, type Table } from 'dexie';
import { exportDB } from 'dexie-export-import';

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

export const carryDb = new Dexie('carry-db') as Dexie & {
  carryItems: Table<CarryItemStorage, string>;
};

export const exportDb = async () => await exportDB(carryDb);

export const importDb = async (blob: Blob) => await Dexie.import(blob);

carryDb.version(1).stores({
  carryItems: 'id, createdAt, name',
});
