import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../index';
import { createSpace, getSpace, getAllSpaces, updateSpace, deleteSpace } from '../space';
import { createPlant, getPlant, getPlantsBySpace, updatePlant, deletePlant } from '../plant';
import { createCareRecord, getCareRecordsByPlant, getLatestCare, deleteCareRecord } from '../care-record';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('Space CRUD', () => {
  const baseSpace = {
    name: '거실',
    windows: [],
    sunlightZones: [],
  };

  it('createSpace: 공간을 생성하고 ID를 반환', async () => {
    const id = await createSpace(baseSpace);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('getSpace: ID로 공간 조회', async () => {
    const id = await createSpace(baseSpace);
    const space = await getSpace(id);
    expect(space).toBeDefined();
    expect(space!.name).toBe('거실');
    expect(space!.createdAt).toBeInstanceOf(Date);
  });

  it('getAllSpaces: 전체 공간 목록 (최신순)', async () => {
    await createSpace({ ...baseSpace, name: '거실' });
    await createSpace({ ...baseSpace, name: '침실' });
    const spaces = await getAllSpaces();
    expect(spaces).toHaveLength(2);
  });

  it('updateSpace: 공간 부분 업데이트', async () => {
    const id = await createSpace(baseSpace);
    await updateSpace(id, { address: '서울 마포구' });
    const space = await getSpace(id);
    expect(space!.address).toBe('서울 마포구');
    expect(space!.name).toBe('거실');
  });

  it('deleteSpace: cascade 삭제', async () => {
    const spaceId = await createSpace(baseSpace);
    const plantId = await createPlant({
      speciesId: 'sp-1',
      spaceId,
      position: { x: 0, y: 0 },
    });
    await createCareRecord({
      plantId,
      type: 'water',
      date: new Date(),
    });

    await deleteSpace(spaceId);

    expect(await getSpace(spaceId)).toBeUndefined();
    expect(await getPlant(plantId)).toBeUndefined();
    const records = await getCareRecordsByPlant(plantId);
    expect(records).toHaveLength(0);
  });
});

describe('Plant CRUD', () => {
  it('createPlant: 식물을 등록하고 ID를 반환', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const id = await createPlant({
      speciesId: 'sp-1',
      spaceId,
      position: { x: 10, y: 20 },
    });
    expect(id).toBeDefined();

    const plant = await getPlant(id);
    expect(plant!.speciesId).toBe('sp-1');
    expect(plant!.registeredAt).toBeInstanceOf(Date);
    expect(plant!.lastCaredAt).toBeInstanceOf(Date);
  });

  it('getPlantsBySpace: 공간별 식물 목록', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    await createPlant({ speciesId: 'sp-1', spaceId, position: { x: 0, y: 0 } });
    await createPlant({ speciesId: 'sp-2', spaceId, position: { x: 10, y: 10 } });
    const plants = await getPlantsBySpace(spaceId);
    expect(plants).toHaveLength(2);
  });

  it('updatePlant: 식물 정보 업데이트', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const id = await createPlant({ speciesId: 'sp-1', spaceId, position: { x: 0, y: 0 } });
    await updatePlant(id, { position: { x: 50, y: 50 } });
    const plant = await getPlant(id);
    expect(plant!.position).toEqual({ x: 50, y: 50 });
  });

  it('deletePlant: cascade 케어기록 삭제', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({ speciesId: 'sp-1', spaceId, position: { x: 0, y: 0 } });
    await createCareRecord({ plantId, type: 'water', date: new Date() });
    await createCareRecord({ plantId, type: 'fertilize', date: new Date() });

    await deletePlant(plantId);

    expect(await getPlant(plantId)).toBeUndefined();
    const records = await getCareRecordsByPlant(plantId);
    expect(records).toHaveLength(0);
  });
});

describe('CareRecord CRUD', () => {
  it('createCareRecord + getCareRecordsByPlant', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({ speciesId: 'sp-1', spaceId, position: { x: 0, y: 0 } });

    await createCareRecord({ plantId, type: 'water', date: new Date('2026-03-01') });
    await createCareRecord({ plantId, type: 'water', date: new Date('2026-03-15') });

    const records = await getCareRecordsByPlant(plantId);
    expect(records).toHaveLength(2);
  });

  it('getLatestCare: 가장 최근 케어 기록 반환', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({ speciesId: 'sp-1', spaceId, position: { x: 0, y: 0 } });

    await createCareRecord({ plantId, type: 'water', date: new Date('2026-03-01') });
    await createCareRecord({ plantId, type: 'water', date: new Date('2026-03-15') });
    await createCareRecord({ plantId, type: 'fertilize', date: new Date('2026-03-10') });

    const latest = await getLatestCare(plantId, 'water');
    expect(latest).toBeDefined();
    expect(new Date(latest!.date).toISOString()).toContain('2026-03-15');
  });

  it('deleteCareRecord: 단일 기록 삭제', async () => {
    const spaceId = await createSpace({ name: '거실', windows: [], sunlightZones: [] });
    const plantId = await createPlant({ speciesId: 'sp-1', spaceId, position: { x: 0, y: 0 } });
    const recordId = await createCareRecord({ plantId, type: 'water', date: new Date() });

    await deleteCareRecord(recordId);

    const records = await getCareRecordsByPlant(plantId);
    expect(records).toHaveLength(0);
  });
});
