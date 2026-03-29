import { db } from './index';
import type { CareRecord } from '@/types/plant';
import type { CareType } from '@/types/common';

/** 케어 기록 생성 (id 자동 설정) */
export async function createCareRecord(
  data: Omit<CareRecord, 'id'>
): Promise<string> {
  const id = crypto.randomUUID();

  await db.transaction('rw', [db.careRecords, db.plants], async () => {
    await db.careRecords.add({ ...data, id });
    await db.plants.update(data.plantId, { lastCaredAt: data.date });
  });

  return id;
}

/** 식물별 케어 기록 (date 내림차순) */
export async function getCareRecordsByPlant(
  plantId: string
): Promise<CareRecord[]> {
  const records = await db.careRecords
    .where('plantId')
    .equals(plantId)
    .sortBy('date');

  return records.reverse();
}

/** 가장 최근 케어 기록 */
export async function getLatestCare(
  plantId: string,
  type: CareType
): Promise<CareRecord | undefined> {
  const records = await db.careRecords
    .where('[plantId+type]')
    .equals([plantId, type])
    .toArray();

  if (records.length === 0) {
    return undefined;
  }

  return records.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

/** 케어 기록 삭제 */
export async function deleteCareRecord(id: string): Promise<void> {
  await db.careRecords.delete(id);
}
