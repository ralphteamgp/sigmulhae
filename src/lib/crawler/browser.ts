import type { Browser } from 'playwright';

let browserInstance: Browser | null = null;

/** Playwright 브라우저 인스턴스 획득 (lazy init) */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance) return browserInstance;

  const { chromium } = await import('playwright');
  browserInstance = await chromium.launch({
    headless: true,
  });

  return browserInstance;
}

/** 브라우저 종료 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
