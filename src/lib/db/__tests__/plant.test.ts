import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { createCareRecord, getCareRecordsByPlant } from '@/lib/db/care-record';
import {
  createPlant,
  deletePlant,
  getPlant,
  getPlantsBySpace,
  updatePlant,
} from '@/lib/db/plant';
import { createSpace } from '@/lib/db/space';

describe('plant db helpers', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('creates and reads plants with generated timestamps', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });

    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId,
      position: { x: 0, y: 0 },
    });

    const plant = await getPlant(plantId);

    expect(plant).toMatchObject({
      id: plantId,
      speciesId: 'sp1',
      spaceId,
      position: { x: 0, y: 0 },
    });
    expect(plant?.registeredAt).toBeInstanceOf(Date);
    expect(plant?.lastCaredAt).toBeInstanceOf(Date);
  });

  it('filters plants by space and updates known plants only', async () => {
    const livingRoomId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const bedroomId = await createSpace({ name: '침실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId: livingRoomId,
      position: { x: 0, y: 0 },
    });
    await createPlant({
      speciesId: 'sp2',
      spaceId: livingRoomId,
      position: { x: 1, y: 1 },
    });
    await createPlant({
      speciesId: 'sp3',
      spaceId: bedroomId,
      position: { x: 2, y: 2 },
    });

    await updatePlant(plantId, { position: { x: 10, y: 20 } });
    await expect(updatePlant('missing-plant', { speciesId: 'none' })).rejects.toThrow(
      'Plant not found'
    );

    const livingRoomPlants = await getPlantsBySpace(livingRoomId);
    const bedroomPlants = await getPlantsBySpace(bedroomId);

    expect(livingRoomPlants).toHaveLength(2);
    expect(bedroomPlants).toHaveLength(1);
    expect((await getPlant(plantId))?.position).toEqual({ x: 10, y: 20 });
  });

  it('cascade deletes care records when a plant is removed', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId,
      position: { x: 0, y: 0 },
    });
    await createCareRecord({ plantId, type: 'water', date: new Date('2026-03-29T00:00:00Z') });

    await deletePlant(plantId);

    expect(await getPlant(plantId)).toBeUndefined();
    expect(await getCareRecordsByPlant(plantId)).toEqual([]);
  });
});
