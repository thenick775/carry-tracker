import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb, type CustomField } from '../db/db.ts';

import type { FilterRange } from './use-carry-items.ts';

export type CustomFieldsValueMap = Partial<Record<string, CustomField[]>>;

export type CarryItemFilterOptions = {
  createdAtRange?: FilterRange;
  carryCountRange?: FilterRange;
  costRange?: FilterRange;
  customFieldOptions: Record<string, string[]>;
  customFieldsValueMap: CustomFieldsValueMap;
};

const toSortedUniqueValues = (values: string[]) => [...new Set(values)].sort();

const toRange = (values: number[]): FilterRange | undefined =>
  values.length > 0 ? [Math.min(...values), Math.max(...values)] : undefined;

const toCustomFieldOptions = (customFields: CustomField[]) =>
  Object.fromEntries(
    toSortedUniqueValues(
      customFields.map((customField) => customField.name)
    ).map((name) => [
      name,
      toSortedUniqueValues(
        customFields
          .filter((customField) => customField.name === name)
          .map((customField) => customField.value)
      )
    ])
  );

const toCustomFieldsValueMap = (customFields: CustomField[]) =>
  Object.groupBy(
    customFields.filter(
      (customField, index) =>
        index ===
        customFields.findIndex(
          (candidate) => candidate.value === customField.value
        )
    ),
    ({ name }) => name
  );

export const useCarryItemFilterOptions = () =>
  useLiveQuery(async (): Promise<CarryItemFilterOptions> => {
    const carryItems = await carryDb.carryItems.toArray();
    const customFields = carryItems.flatMap(
      (carryItem) => carryItem.customFields ?? []
    );
    const createdAtValues = carryItems.map((carryItem) =>
      dayjs(carryItem.createdAt).startOf('day').valueOf()
    );
    const carryCountValues = carryItems.map(
      (carryItem) => carryItem.carryCount
    );
    const costValues = carryItems
      .map((carryItem) => carryItem.cost)
      .filter((cost) => cost !== undefined);

    return {
      createdAtRange: toRange(createdAtValues),
      carryCountRange: toRange(carryCountValues),
      costRange: toRange(costValues),
      customFieldOptions: toCustomFieldOptions(customFields),
      customFieldsValueMap: toCustomFieldsValueMap(customFields)
    };
  }, []);
