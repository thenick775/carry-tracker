import { Dexie, type Table } from 'dexie';

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

carryDb.version(1).stores({
  carryItems: 'id, createdAt, name',
});
