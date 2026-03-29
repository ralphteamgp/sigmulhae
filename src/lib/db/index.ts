import Dexie, { type EntityTable } from 'dexie';
import type { Space } from '@/types/space';
import type { Plant, CareRecord } from '@/types/plant';

const db = new Dexie('plantfit') as Dexie & {
  spaces: EntityTable<Space, 'id'>;
  plants: EntityTable<Plant, 'id'>;
  careRecords: EntityTable<CareRecord, 'id'>;
};

db.version(1).stores({
  spaces: 'id, name, createdAt',
  plants: 'id, speciesId, spaceId, registeredAt',
  careRecords: 'id, plantId, type, date, [plantId+type]',
});

export { db };
