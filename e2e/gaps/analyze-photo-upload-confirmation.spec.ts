import { test, expect } from '../fixtures/gap-test';
import { createUploadFile } from '../helpers/upload-fixture';

test.describe('사진 업로드 후 AI 방향 확인 UI가 나타나야 한다', () => {
  test('업로드 후 방향 확인 카드 또는 수동 방향 선택기가 표시되어야 한다', async ({
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

    // GAP ASSERTION: After upload, photo analysis should trigger.
    // If API succeeds: AI direction confirmation card (이 창문은, 네 맞아요, 아니요 달라요)
    // If API fails: manual direction picker (8방위 버튼 그리드)
    // Either proves the photo analysis flow is connected.

    const aiConfirmation = page.getByText('이 창문은');
    const manualPicker = page.getByText('북동'); // one of the 8 direction buttons

    // Wait for either UI to appear (API call + response takes time)
    await expect(aiConfirmation.or(manualPicker)).toBeVisible({
      timeout: 10000,
    });
  });
});
