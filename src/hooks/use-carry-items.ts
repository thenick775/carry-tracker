import { useLocalStorage } from '@mantine/hooks';

const STORAGE_KEY = 'carry-items';

export type CarryItem = {
  id: string;
  name: string;
  carryCount: number;
  createdAt: string;
};

export const useCarryItems = () =>
  useLocalStorage<CarryItem[]>({
    key: STORAGE_KEY,
    defaultValue: [],
    getInitialValueInEffect: false,
  });
