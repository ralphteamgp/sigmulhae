import { db } from './index';
import type { Plant } from '@/types/plant';

/** 식물 등록 (id, registeredAt, lastCaredAt 자동 설정) */
export async function createPlant(
  data: Omit<Plant, 'id' | 'registeredAt' | 'lastCaredAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.plants.add({ ...data, id, registeredAt: now, lastCaredAt: now });
  return id;
}

/** ID로 식물 조회 */
export async function getPlant(id: string): Promise<Plant | undefined> {
  return db.plants.get(id);
}

/** 공간별 식물 목록 */
export async function getPlantsBySpace(spaceId: string): Promise<Plant[]> {
  return db.plants.where('spaceId').equals(spaceId).toArray();
}

/** 식물 정보 업데이트 */
export async function updatePlant(
  id: string,
  changes: Partial<Plant>
): Promise<void> {
  await db.plants.update(id, changes);
}

/** 식물 삭제 + 연관 케어기록 cascade 삭제 */
export async function deletePlant(id: string): Promise<void> {
  await db.transaction('rw', [db.plants, db.careRecords], async () => {
    await db.careRecords.where('plantId').equals(id).delete();
    await db.plants.delete(id);
  });
}
