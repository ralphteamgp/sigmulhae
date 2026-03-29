import { test, expect } from '../fixtures/gap-test';

test.describe('분석 없이 식물 추천이 노출되면 안 된다', () => {
  test('분석 데이터 없는 상태에서 /plants 진입 시 추천 카드가 보이면 안 되고 안내 문구가 보여야 한다', async ({
    page,
  }) => {
    // Visit /plants with completely clean state (no analysis)
    await page.goto('/plants');

    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    // GAP ASSERTION: Without prior analysis, recommendation cards should NOT appear
    // Instead, a gating message like "먼저 우리 집 분석을 완료해주세요" should be visible
    // Current code loads local seed data regardless of analysis state

    // Verify that plant cards ARE visible (confirming the gap)
    const monsteraVisible = await page.getByText('몬스테라').isVisible();
    const pothoVisible = await page.getByText('스킨답서스').isVisible();
    const sansevieriaVisible = await page.getByText('산세비에리아').isVisible();

    // At least one plant should be showing (confirms gap exists)
    expect(monsteraVisible || pothoVisible || sansevieriaVisible).toBe(true);

    // The DESIRED behavior: gating message should be visible
    await expect(
      page.getByText('먼저 우리 집 분석을 완료해주세요'),
    ).toBeVisible({ timeout: 3000 });
  });
});
