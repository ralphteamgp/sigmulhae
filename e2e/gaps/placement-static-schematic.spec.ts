import { test, expect } from '../fixtures/gap-test';

test.describe('배치 시각화가 분석 기반이어야 하며 정적 스캐매틱이면 안 된다', () => {
  test('배치 페이지가 고정 거실/침실/주방 레이아웃과 canned Best Spot을 보여주면 안 된다', async ({
    page,
  }) => {
    // Navigate to /plants → select → placement
    await page.goto('/plants');
    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    await page.getByText('몬스테라').first().click();
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(
      page.getByRole('heading', { name: '식물 배치 추천' }),
    ).toBeVisible();

    // GAP ASSERTION: These static/canned elements should NOT be present
    // if the layout were analysis-specific. Currently they are always rendered.

    // Static room labels
    const livingRoom = page.getByText('거실', { exact: false }).first();
    const bedroom = page.getByText('침실');
    const kitchen = page.getByText('주방');

    // Canned best spot copy
    const bestSpot = page.getByText('✦ Best Spot');
    const bestSpotLocation = page.getByText('거실 창가');

    // All static elements should be visible (confirms gap)
    await expect(livingRoom).toBeVisible();
    await expect(bedroom).toBeVisible();
    await expect(kitchen).toBeVisible();
    await expect(bestSpot).toBeVisible();
    await expect(bestSpotLocation).toBeVisible();

    // The DESIRED behavior: placement should render an actual floorplan image
    // from analysis, not static room boxes
    const floorplanImage = page.locator(
      'img[alt*="floorplan"], img[alt*="평면도"], canvas',
    );
    await expect(floorplanImage).toBeVisible({ timeout: 3000 });
  });
});
