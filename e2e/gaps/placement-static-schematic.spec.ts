import { test, expect } from '../fixtures/gap-test';
import { seedAnalyzedSpace } from '../helpers/seed-analysis';

test.describe('배치 시각화가 분석 기반이어야 하며 정적 스캐매틱이면 안 된다', () => {
  test('분석 데이터가 있을 때 동적 채광 구역이 표시되고 정적 레이아웃이 아니어야 한다', async ({
    page,
  }) => {
    // Seed analysis data with sunlight zones
    await seedAnalyzedSpace(page);

    // Navigate to /plants → select → placement
    await page.goto('/plants');
    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    await expect(page.getByText('몬스테라')).toBeVisible({ timeout: 5000 });
    await page.getByText('몬스테라').first().click();
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(
      page.getByRole('heading', { name: '식물 배치 추천' }),
    ).toBeVisible();

    // Analysis-based zones should be visible (from seeded data)
    const zoneIndicator = page.getByText('간접광').or(page.getByText('음지'));
    await expect(zoneIndicator.first()).toBeVisible({ timeout: 3000 });

    // Static canned room labels should NOT be visible when analysis exists
    await expect(page.getByText('거실', { exact: true })).not.toBeVisible();
    await expect(page.getByText('침실')).not.toBeVisible();
    await expect(page.getByText('주방')).not.toBeVisible();

    // Recommendation should be analysis-based, not canned copy
    const analysisRec = page.getByText('채광 분석 기반');
    await expect(analysisRec).toBeVisible();
  });
});
