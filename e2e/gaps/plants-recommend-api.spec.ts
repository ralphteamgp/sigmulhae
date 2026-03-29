import { test, expect } from '../fixtures/gap-test';

test.describe('/plants 페이지가 추천 API를 호출해야 한다', () => {
  test('분석된 Space가 있을 때 /api/plants/recommend 요청이 발생해야 한다', async ({
    page,
  }) => {
    // Seed an analyzed Space record into IndexedDB (browser-side state seeding)
    await page.goto('/');
    await page.evaluate(async () => {
      // Open Dexie DB and add a mock analyzed space
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
                area: { x: 0, y: 0, width: 100, height: 100 },
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

    // Track requests to /api/plants/recommend
    let recommendCallCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/api/plants/recommend')) {
        recommendCallCount++;
      }
    });

    // Navigate to /plants with analyzed space in DB
    await page.goto('/plants');
    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    // Wait a bit for any potential API calls
    await page.waitForTimeout(2000);

    // GAP ASSERTION: /api/plants/recommend should have been called at least once
    // Current code never calls this API — loads local seed data instead
    expect(recommendCallCount).toBeGreaterThan(0);
  });
});
