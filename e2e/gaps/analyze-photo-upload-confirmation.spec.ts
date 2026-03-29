import { test, expect } from '../fixtures/gap-test';
import { createUploadFile } from '../helpers/upload-fixture';

test.describe('사진 업로드 후 AI 방향 확인 UI가 나타나야 한다', () => {
  test('업로드 후 방향 확인 카드(이 창문은, 네 맞아요, 아니요 달라요)가 표시되어야 한다', async ({
    page,
  }) => {
    // Navigate to analyze page
    await page.goto('/analyze');
    await expect(
      page.getByRole('heading', { name: '우리 집 분석하기' }),
    ).toBeVisible();

    // Upload one in-memory PNG via hidden file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([createUploadFile()]);

    // Verify upload preview thumbnail appears
    await expect(page.locator('img[alt="photo 1"]')).toBeVisible({
      timeout: 5000,
    });

    // GAP ASSERTION: AI direction confirmation card should appear after upload
    // Current code never sets aiDirection, so this will fail
    await expect(page.getByText('이 창문은')).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByRole('button', { name: '네, 맞아요' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '아니요, 달라요' }),
    ).toBeVisible();
  });
});
