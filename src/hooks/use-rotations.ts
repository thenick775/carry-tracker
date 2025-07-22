import { useLiveQuery } from 'dexie-react-hooks';

import { carryDb, type RotationStorage, type TimeUnit } from '../db/db.ts';

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

const convertToStorage = (rotation: Rotation): RotationStorage => {
  const { active, ...rest } = rotation;
  return { ...rest, active: active ? 1 : 0 };
};

const convertFromStorage = (rotation: RotationStorage): Rotation => {
  const { active, ...rest } = rotation;
  return {
    ...rest,
    active: !!active
  };
};

export const useRotations = () => {
  const rotations = useLiveQuery(async () => {
    const rotations = await carryDb.rotations
      .orderBy('createdAt')
      .reverse()
      .toArray();

    return rotations.map(convertFromStorage);
  }, []);

  const createRotation = async (input: CreateRotation) => {
    const id = crypto.randomUUID();
    const rotation = convertToStorage({ ...input, id });
    await carryDb.rotations.add(rotation);
  };

  const updateRotation = async (
    id: string,
    { active, ...rest }: Partial<Rotation>
  ) => {
    const isActive = active ? 1 : 0;
    await carryDb.rotations.update(id, { ...rest, active: isActive });
  };

  const deleteRotation = async (id: string) =>
    await carryDb.rotations.delete(id);

  return {
    rotations,
    createRotation,
    updateRotation,
    deleteRotation
  };
};

export const useActiveRotations = () => {
  return useLiveQuery(async () => {
    const rotations = await carryDb.rotations
      .where('active')
      .equals(1)
      .sortBy('createdAt');

    return rotations.reverse().map(convertFromStorage);
  }, []);
};
