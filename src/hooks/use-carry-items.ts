import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb, type CarryItemStorage, type CustomFields } from '../db/db.ts';

export type CarryItem = {
  id: string;
  name: string;
  carryCount: number;
  createdAt: string;
  color: string;
  imageData?: File;
  cost?: number;
  customFields?: CustomFields;
};

export type CreateCarryItem = Omit<CarryItem, 'id'>;
export type FilterRange = [number, number];

export type CarryItemFilters = {
  search?: string;
  createdAt?: FilterRange;
  carryCount?: FilterRange;
  cost?: FilterRange;
  customFields?: Record<string, string[]>;
};

const toCustomFieldKey = ({ name, value }: { name: string; value: string }) =>
  `${name}::${value}`;

const toCustomFieldKeys = (customFields?: CustomFields) =>
  customFields?.map(toCustomFieldKey);

const getActiveCustomFieldFilters = (customFields?: Record<string, string[]>) =>
  Object.entries(customFields ?? {}).filter(([, values]) => values.length > 0);

const getCreatedAtIsoRange = (range?: FilterRange) =>
  range
    ? [
        dayjs(range[0]).startOf('day').toISOString(),
        dayjs(range[1]).add(1, 'day').startOf('day').toISOString()
      ]
    : undefined;

const fileToUint8Array = async (file: File): Promise<Uint8Array> =>
  new Uint8Array(await file.arrayBuffer());

const uint8ArrayToFile = (
  name: string,
  mimeType: string,
  data: Uint8Array
): File => new File([data.slice()], name, { type: mimeType });

const buildImage = async (
  file?: File
): Promise<CarryItemStorage['image'] | undefined> => {
  if (!file) {
    return undefined;
  }
  const data = await fileToUint8Array(file);
  return {
    name: file.name,
    mimeType: file.type,
    data
  };
};

const convertToStorage = async (item: CarryItem): Promise<CarryItemStorage> => {
  const { imageData, customFields, ...rest } = item;
  const image = await buildImage(imageData);
  return {
    ...rest,
    customFields,
    customFieldKeys: toCustomFieldKeys(customFields),
    image
  };
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

const matchesCustomFieldFilters = (
  customFieldKeys: string[] | undefined,
  customFieldFilters: [string, string[]][]
) =>
  customFieldFilters.every(([name, values]) =>
    values.some((value) =>
      customFieldKeys?.includes(toCustomFieldKey({ name, value }))
    )
  );

const matchesRange = (value: number, range?: FilterRange) =>
  !range || (value >= range[0] && value <= range[1]);

const matchesCostRange = (value: number | undefined, range?: FilterRange) =>
  !range || (value !== undefined && matchesRange(value, range));

const matchesCarryItemFilters = (
  carryItem: CarryItemStorage,
  filters: CarryItemFilters | undefined,
  customFieldFilters: [string, string[]][],
  createdAtIsoRange: string[] | undefined,
  search: string | undefined
) =>
  (!search ||
    carryItem.name.toLowerCase().includes(search.trim().toLowerCase())) &&
  (!createdAtIsoRange ||
    (carryItem.createdAt >= createdAtIsoRange[0] &&
      carryItem.createdAt < createdAtIsoRange[1])) &&
  matchesRange(carryItem.carryCount, filters?.carryCount) &&
  matchesCostRange(carryItem.cost, filters?.cost) &&
  matchesCustomFieldFilters(carryItem.customFieldKeys, customFieldFilters);

const getBaseQuery = (
  filters: CarryItemFilters | undefined,
  customFieldFilters: [string, string[]][],
  createdAtIsoRange: string[] | undefined
) => {
  if (customFieldFilters.length > 0) {
    const [name, values] = customFieldFilters[0];

    return carryDb.carryItems
      .where('customFieldKeys')
      .anyOf(values.map((value) => toCustomFieldKey({ name, value })))
      .distinct();
  }

  if (createdAtIsoRange) {
    return carryDb.carryItems
      .where('createdAt')
      .between(createdAtIsoRange[0], createdAtIsoRange[1], true, false);
  }

  if (filters?.carryCount) {
    return carryDb.carryItems
      .where('carryCount')
      .between(filters.carryCount[0], filters.carryCount[1], true, true);
  }

  if (filters?.cost) {
    return carryDb.carryItems
      .where('cost')
      .between(filters.cost[0], filters.cost[1], true, true);
  }

  return carryDb.carryItems.orderBy('createdAt').reverse();
};

export const useCarryItems = (filters?: CarryItemFilters) => {
  const carryItems = useLiveQuery(async () => {
    const search = filters?.search;
    const customFieldFilters = getActiveCustomFieldFilters(
      filters?.customFields
    );
    const createdAtIsoRange = getCreatedAtIsoRange(filters?.createdAt);
    const query = getBaseQuery(filters, customFieldFilters, createdAtIsoRange);

    return (
      await query
        .and((carryItem) =>
          matchesCarryItemFilters(
            carryItem,
            filters,
            customFieldFilters,
            createdAtIsoRange,
            search
          )
        )
        .toArray()
    )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(convertFromStorage);
  }, [filters]);

  const createCarryItem = async (input: CreateCarryItem) => {
    const id = crypto.randomUUID();
    const item = await convertToStorage({ ...input, id });
    await carryDb.carryItems.add(item);
  };

  const updateCarryItem = async (id: string, updates: Partial<CarryItem>) => {
    const { imageData, customFields, ...rest } = updates;
    const partialUpdate: Partial<CarryItemStorage> = { ...rest, id };

    if (imageData) {
      partialUpdate.image = await buildImage(imageData);
    }
    if ('customFields' in updates) {
      partialUpdate.customFields = customFields;
      partialUpdate.customFieldKeys = toCustomFieldKeys(customFields);
    }

    const nextCarryCount = partialUpdate.carryCount;
    if (typeof nextCarryCount !== 'number') {
      await carryDb.carryItems.update(id, partialUpdate);
      return;
    }

    const before = await carryDb.carryItems.get(id);
    if (!before) {
      return;
    }

    await carryDb.carryItems.update(id, partialUpdate);

    if (before.carryCount === nextCarryCount) {
      return;
    }

    void carryDb.carriesOverTime.add({
      id: crypto.randomUUID(),
      carryItemId: id,
      createdAt: dayjs().toISOString(),
      currentCarryCount: nextCarryCount
    });
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
