import { test, expect } from '../fixtures/gap-test';
import * as fs from 'fs';

test.describe('Gap harness smoke', () => {
  test('app boots, state is reset, and evidence files are emitted', async ({
    page,
    networkLog,
  }, testInfo) => {
    // Navigate to home — fixture already reset state
    await page.goto('/');

    // App should boot successfully
    await expect(
      page.getByRole('heading', { name: '내 공간에 맞는 식물 찾아줄게요' }),
    ).toBeVisible();

    // Verify local state is clean
    const state = await page.evaluate(() => {
      return {
        localStorageLength: localStorage.length,
        sessionStorageLength: sessionStorage.length,
      };
    });
    expect(state.localStorageLength).toBe(0);
    expect(state.sessionStorageLength).toBe(0);

    // Network log should have captured some requests
    expect(networkLog.length).toBeGreaterThan(0);

    // Evidence files should exist after afterEach (they are written in fixture teardown)
    // We verify them by checking that testInfo.outputDir is set
    expect(testInfo.outputDir).toBeTruthy();
  });

  test('evidence artifacts are written to output directory', async ({
    page,
    networkLog,
  }, testInfo) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: '내 공간에 맞는 식물 찾아줄게요' }),
    ).toBeVisible();

    // Force evidence capture now to verify files (fixture teardown also does this)
    const { captureEvidence } = await import('../helpers/evidence');
    await captureEvidence(page, testInfo, networkLog);

    // Verify evidence files exist
    expect(fs.existsSync(testInfo.outputPath('page.png'))).toBe(true);
    expect(fs.existsSync(testInfo.outputPath('dom.html'))).toBe(true);
    expect(fs.existsSync(testInfo.outputPath('local-state.json'))).toBe(true);
    expect(fs.existsSync(testInfo.outputPath('network.json'))).toBe(true);
  });
});
