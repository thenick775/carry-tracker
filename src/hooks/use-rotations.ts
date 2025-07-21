import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb, type TimeUnit } from '../db/db.ts';

export type Rotation = {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  activeAt?: string;
  orderedCarryItemIds: string[];
  stepDuration: {
    duration: number;
    unit: TimeUnit;
  };
};

export type CreateRotation = Omit<Rotation, 'id'>;

export const useRotations = () => {
  const rotations = useLiveQuery(
    async () =>
      await carryDb.rotations.orderBy('createdAt').reverse().toArray(),
    []
  );

  const createRotation = async (input: CreateRotation) => {
    const id = crypto.randomUUID();
    const rotation = { ...input, id };
    await carryDb.rotations.add(rotation);
  };

  const updateRotation = async (id: string, updates: Partial<Rotation>) =>
    await carryDb.rotations.update(id, updates);

  const deleteRotation = async (id: string) =>
    await carryDb.rotations.delete(id);

  return {
    rotations,
    createRotation,
    updateRotation,
    deleteRotation
  };
};
