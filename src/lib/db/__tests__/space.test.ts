import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { createPlant, getPlant } from '@/lib/db/plant';
import { createCareRecord, getCareRecordsByPlant } from '@/lib/db/care-record';
import {
  createSpace,
  deleteSpace,
  getAllSpaces,
  getSpace,
  updateSpace,
} from '@/lib/db/space';

describe('space db helpers', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('creates and reads a space with generated metadata', async () => {
    const id = await createSpace({
      name: '거실',
      windows: [],
      sunlightZones: [],
    });

    const space = await getSpace(id);

    expect(id).toBeTypeOf('string');
    expect(space).toMatchObject({
      id,
      name: '거실',
      windows: [],
      sunlightZones: [],
    });
    expect(space?.createdAt).toBeInstanceOf(Date);
  });

  it('returns all created spaces', async () => {
    await createSpace({
      name: '첫 공간',
      windows: [],
      sunlightZones: [],
    });
    await createSpace({
      name: '둘째 공간',
      windows: [],
      sunlightZones: [],
    });

    const spaces = await getAllSpaces();

    expect(spaces).toHaveLength(2);
    const names = spaces.map((s) => s.name);
    expect(names).toContain('첫 공간');
    expect(names).toContain('둘째 공간');
  });

  it('updates a space and rejects unknown ids', async () => {
    const id = await createSpace({
      name: '업데이트 전',
      windows: [],
      sunlightZones: [],
    });

    await updateSpace(id, { name: '업데이트 후' });
    await expect(updateSpace('missing-space', { name: '실패' })).rejects.toThrow(
      'Space not found'
    );

    const updated = await getSpace(id);
    expect(updated?.name).toBe('업데이트 후');
  });

  it('cascade deletes plants and care records when a space is removed', async () => {
    const spaceId = await createSpace({
      name: '삭제 대상 공간',
      windows: [],
      sunlightZones: [],
    });
    const plantId = await createPlant({
      speciesId: 'sp1',
      spaceId,
      position: { x: 1, y: 2 },
    });
    await createCareRecord({ plantId, type: 'water', date: new Date('2026-03-29T00:00:00Z') });

    await deleteSpace(spaceId);

    expect(await getSpace(spaceId)).toBeUndefined();
    expect(await getPlant(plantId)).toBeUndefined();
    expect(await getCareRecordsByPlant(plantId)).toEqual([]);
  });
});
