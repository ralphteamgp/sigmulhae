import type { Page } from '@playwright/test';

/**
 * Reset all local state: sessionStorage, localStorage, IndexedDB 'plantfit'
 * Must be called after page.goto() so we have a page context.
 */
export async function resetLocalState(page: Page): Promise<void> {
  await page.evaluate(async () => {
    sessionStorage.clear();
    localStorage.clear();
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('plantfit');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
}
