import { test, expect } from '../fixtures/gap-test';
import { seedAnalyzedSpace } from '../helpers/seed-analysis';

test.describe('케어 기록에서 다중 식물 전환 UI가 있어야 한다', () => {
  test('두 식물 등록 후 케어 기록 페이지에서 식물 전환 컨트롤이 보여야 한다', async ({
    page,
  }) => {
    // Seed analysis data so plants page shows recommendations
    await seedAnalyzedSpace(page);

    // Path: /plants → select two plants → placement → care → records
    await page.goto('/plants');
    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    // Wait for plants to load
    await expect(page.getByText('몬스테라')).toBeVisible({ timeout: 5000 });

    // Select 몬스테라 and 산세비에리아
    await page.getByText('몬스테라').first().click();
    await page.getByText('산세비에리아').first().click();

    // Go to placement
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(
      page.getByRole('heading', { name: '식물 배치 추천' }),
    ).toBeVisible();

    // Register plants (케어 시작하기)
    await page.getByRole('button', { name: '케어 시작하기 →' }).click();
    await expect(
      page.getByRole('heading', { name: '식물 상태 코멘트' }),
    ).toBeVisible();

    // Verify both plants are shown on /care
    await expect(page.getByText('몬스테라')).toBeVisible();
    await expect(page.getByText('산세비에리아')).toBeVisible();

    // Click the global CTA (not per-card 📋 기록)
    await page.getByRole('button', { name: '케어 기록 보기 →' }).click();
    await expect(
      page.getByRole('heading', { name: '케어 기록 & 성장 트래킹' }),
    ).toBeVisible();

    // A visible plant-switching control should exist
    // Look for buttons with the second plant name (산세비에리아)
    const switcherButton = page.getByRole('button', {
      name: /산세비에리아/,
    });
    await expect(switcherButton).toBeVisible({ timeout: 3000 });
  });
});
