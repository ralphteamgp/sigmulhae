import type { Page } from '@playwright/test';

/**
 * Seed an analyzed Space record into IndexedDB to unlock analysis-gated pages.
 * Navigates to app root first to ensure valid browser context for IndexedDB.
 */
export async function seedAnalyzedSpace(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async () => {
    const openReq = indexedDB.open('plantfit', 1);
    await new Promise<void>((resolve, reject) => {
      openReq.onupgradeneeded = () => {
        const db = openReq.result;
        if (!db.objectStoreNames.contains('spaces')) {
          db.createObjectStore('spaces', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('plants')) {
          db.createObjectStore('plants', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('careRecords')) {
          db.createObjectStore('careRecords', { keyPath: 'id' });
        }
      };
      openReq.onsuccess = () => {
        const db = openReq.result;
        const tx = db.transaction('spaces', 'readwrite');
        tx.objectStore('spaces').put({
          id: 'test-space-1',
          name: '거실',
          address: '서울특별시 마포구 연남동 123-1',
          buildingAzimuth: 180,
          windows: [
            {
              id: 'w1',
              direction: 'S',
              size: 'medium',
              position: { x: 50, y: 10 },
            },
          ],
          sunlightZones: [
            {
              id: 'z1',
              grade: 'medium',
              area: { x: 0, y: 0, width: 60, height: 50 },
            },
            {
              id: 'z2',
              grade: 'weak',
              area: { x: 60, y: 0, width: 40, height: 100 },
            },
          ],
          createdAt: new Date(),
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      openReq.onerror = () => reject(openReq.error);
    });
  });
}
