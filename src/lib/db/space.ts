import { db } from './index';
import type { Space } from '@/types/space';

/** 공간 생성 (id, createdAt 자동 설정) */
export async function createSpace(
  data: Omit<Space, 'id' | 'createdAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  await db.spaces.add({ ...data, id, createdAt: new Date() });
  return id;
}

/** ID로 공간 조회 */
export async function getSpace(id: string): Promise<Space | undefined> {
  return db.spaces.get(id);
}

/** 전체 공간 목록 (createdAt 내림차순) */
export async function getAllSpaces(): Promise<Space[]> {
  return db.spaces.orderBy('createdAt').reverse().toArray();
}

/** 공간 부분 업데이트 */
export async function updateSpace(
  id: string,
  changes: Partial<Space>
): Promise<void> {
  await db.spaces.update(id, changes);
}

/** 공간 삭제 + 연관 식물/케어기록 cascade 삭제 */
export async function deleteSpace(id: string): Promise<void> {
  await db.transaction('rw', [db.spaces, db.plants, db.careRecords], async () => {
    const plants = await db.plants.where('spaceId').equals(id).toArray();
    const plantIds = plants.map((p) => p.id);

    if (plantIds.length > 0) {
      await db.careRecords
        .where('plantId')
        .anyOf(plantIds)
        .delete();
      await db.plants.where('spaceId').equals(id).delete();
    }

    await db.spaces.delete(id);
  });
}
