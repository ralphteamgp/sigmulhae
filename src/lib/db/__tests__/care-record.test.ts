import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import {
  createCareRecord,
  deleteCareRecord,
  getCareRecordsByPlant,
  getLatestCare,
} from '@/lib/db/care-record';
import { createPlant, getPlant } from '@/lib/db/plant';
import { createSpace } from '@/lib/db/space';

describe('care record db helpers', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('creates a care record and updates the plant last-cared timestamp', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId,
      position: { x: 0, y: 0 },
    });
    const careDate = new Date('2026-03-29T00:00:00Z');

    const careId = await createCareRecord({ plantId, type: 'water', date: careDate });

    const records = await getCareRecordsByPlant(plantId);
    expect(careId).toBeTypeOf('string');
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ id: careId, plantId, type: 'water', date: careDate });
    expect((await getPlant(plantId))?.lastCaredAt).toEqual(careDate);
  });

  it('returns care history in descending date order and finds the latest entry by type', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId,
      position: { x: 0, y: 0 },
    });
    await createCareRecord({
      plantId,
      type: 'water',
      date: new Date('2026-03-01T00:00:00Z'),
    });
    await createCareRecord({
      plantId,
      type: 'repot',
      date: new Date('2026-03-10T00:00:00Z'),
    });
    await createCareRecord({
      plantId,
      type: 'water',
      date: new Date('2026-03-20T00:00:00Z'),
    });

    const records = await getCareRecordsByPlant(plantId);
    const latestWater = await getLatestCare(plantId, 'water');
    const latestFertilize = await getLatestCare(plantId, 'fertilize');

    expect(records.map((record) => record.type)).toEqual(['water', 'repot', 'water']);
    expect(latestWater?.date).toEqual(new Date('2026-03-20T00:00:00Z'));
    expect(latestFertilize).toBeUndefined();
  });

  it('deletes only the targeted care record', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId,
      position: { x: 0, y: 0 },
    });
    const firstId = await createCareRecord({
      plantId,
      type: 'water',
      date: new Date('2026-03-01T00:00:00Z'),
    });
    await createCareRecord({
      plantId,
      type: 'repot',
      date: new Date('2026-03-02T00:00:00Z'),
    });

    await deleteCareRecord(firstId);

    const records = await getCareRecordsByPlant(plantId);
    expect(records).toHaveLength(1);
    expect(records[0].type).toBe('repot');
  });
});
