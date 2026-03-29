import { test, expect } from '../fixtures/gap-test';

test.describe('분석 없이 식물 추천이 노출되면 안 된다', () => {
  test('분석 데이터 없는 상태에서 /plants 진입 시 안내 문구가 보여야 한다', async ({
    page,
  }) => {
    // Visit /plants with completely clean state (no analysis)
    await page.goto('/plants');

    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    // DESIRED behavior: gating message should be visible when no analysis exists
    await expect(
      page.getByText('먼저 우리 집 분석을 완료해주세요'),
    ).toBeVisible({ timeout: 5000 });

    // Plant cards should NOT be visible without analysis
    await expect(page.getByText('몬스테라')).not.toBeVisible();
    await expect(page.getByText('스킨답서스')).not.toBeVisible();
  });
});
