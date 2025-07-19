import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb, type CarryItemStorage } from '../db/db.ts';

export type CarryItem = {
  id: string;
  name: string;
  carryCount: number;
  createdAt: string;
  color: string;
  imageData?: File;
};

export type CreateCarryItem = Omit<CarryItem, 'id'>;

const fileToUint8Array = async (file: File): Promise<Uint8Array> =>
  new Uint8Array(await file.arrayBuffer());

const uint8ArrayToFile = (
  name: string,
  mimeType: string,
  data: Uint8Array
): File => new File([data], name, { type: mimeType });

const buildImage = async (
  file?: File
): Promise<CarryItemStorage['image'] | undefined> => {
  if (!file) return undefined;
  const data = await fileToUint8Array(file);
  return {
    name: file.name,
    mimeType: file.type,
    data
  };
};

const convertToStorage = async (item: CarryItem): Promise<CarryItemStorage> => {
  const { imageData, ...rest } = item;
  const image = await buildImage(imageData);
  return { ...rest, image };
};

const convertFromStorage = (item: CarryItemStorage): CarryItem => {
  const { image, ...rest } = item;
  return {
    ...rest,
    imageData: image
      ? uint8ArrayToFile(image.name, image.mimeType, image.data)
      : undefined
  };
};

export const useCarryItems = () => {
  const carryItems = useLiveQuery(async () => {
    const items = await carryDb.carryItems
      .orderBy('createdAt')
      .reverse()
      .toArray();

    return items.map(convertFromStorage);
  }, []);

  const createCarryItem = async (input: CreateCarryItem) => {
    const id = crypto.randomUUID();
    const item = await convertToStorage({ ...input, id });
    await carryDb.carryItems.add(item);
  };

  const updateCarryItem = async (id: string, updates: Partial<CarryItem>) => {
    const { imageData, ...rest } = updates;
    const partialUpdate: Partial<CarryItemStorage> = { ...rest, id };

    if (imageData) partialUpdate.image = await buildImage(imageData);

    await carryDb.carryItems.update(id, partialUpdate);
  };

  const deleteCarryItem = async (id: string) =>
    await carryDb.carryItems.delete(id);

  return {
    carryItems,
    createCarryItem,
    updateCarryItem,
    deleteCarryItem
  };
};
