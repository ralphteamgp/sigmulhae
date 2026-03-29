import { test, expect } from '../fixtures/gap-test';
import { seedAnalyzedSpace } from '../helpers/seed-analysis';

test.describe('배치 페이지에서 식물 드래그가 실제로 작동해야 한다', () => {
  test('식물 핀을 드래그하면 위치가 변경되어야 한다', async ({ page }) => {
    // Seed analysis data so plants page doesn't gate
    await seedAnalyzedSpace(page);

    // Select plants on /plants page
    await page.goto('/plants');
    await expect(
      page.getByRole('heading', { name: '식물 추천 리스트' }),
    ).toBeVisible();

    // Wait for plants to load
    await expect(page.getByText('몬스테라')).toBeVisible({ timeout: 5000 });

    // Click 몬스테라 and 산세비에리아
    await page.getByText('몬스테라').first().click();
    await page.getByText('산세비에리아').first().click();

    // Navigate to placement
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(
      page.getByRole('heading', { name: '식물 배치 추천' }),
    ).toBeVisible();

    // Verify drag help text exists
    await expect(
      page.getByText('평면도에서 식물을 드래그해 배치를 조정할 수 있어요'),
    ).toBeVisible();

    // Find the first plant pin
    const plantPin = page.locator('.rounded-full:has-text("🌿")').first();
    await expect(plantPin).toBeVisible();

    // Capture bounding box before drag
    const boxBefore = await plantPin.boundingBox();
    expect(boxBefore).toBeTruthy();

    // Attempt drag using mouse API
    const cx = boxBefore!.x + boxBefore!.width / 2;
    const cy = boxBefore!.y + boxBefore!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 120, cy + 80, { steps: 10 });
    await page.mouse.up();

    // Small wait for state update
    await page.waitForTimeout(500);

    // Capture bounding box after drag
    const boxAfter = await plantPin.boundingBox();
    expect(boxAfter).toBeTruthy();

    // Position should have changed after drag
    const moved =
      Math.abs(boxAfter!.x - boxBefore!.x) > 10 ||
      Math.abs(boxAfter!.y - boxBefore!.y) > 10;
    expect(moved).toBe(true);
  });
});
