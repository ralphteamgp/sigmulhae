import type { Page, TestInfo } from '@playwright/test';

export interface NetworkEntry {
  url: string;
  method: string;
  status: number | null;
}

/**
 * Captures evidence artifacts for a test:
 * - page.png: screenshot
 * - dom.html: full page HTML
 * - local-state.json: localStorage + sessionStorage snapshot
 * - network.json: captured network requests
 */
export async function captureEvidence(
  page: Page,
  testInfo: TestInfo,
  networkLog: NetworkEntry[],
): Promise<void> {
  // Screenshot
  const screenshotPath = testInfo.outputPath('page.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // DOM HTML
  const html = await page.content();
  const htmlPath = testInfo.outputPath('dom.html');
  const fs = await import('fs');
  fs.writeFileSync(htmlPath, html, 'utf-8');

  // Local state
  const localState = await page.evaluate(() => {
    const ls: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) ls[key] = localStorage.getItem(key) ?? '';
    }
    const ss: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) ss[key] = sessionStorage.getItem(key) ?? '';
    }
    return { localStorage: ls, sessionStorage: ss };
  });
  const statePath = testInfo.outputPath('local-state.json');
  fs.writeFileSync(statePath, JSON.stringify(localState, null, 2), 'utf-8');

  // Network log
  const networkPath = testInfo.outputPath('network.json');
  fs.writeFileSync(networkPath, JSON.stringify(networkLog, null, 2), 'utf-8');
}
