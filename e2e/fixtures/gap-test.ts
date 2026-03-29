import { test as base } from '@playwright/test';
import { resetLocalState } from '../helpers/reset-local-state';
import { captureEvidence, type NetworkEntry } from '../helpers/evidence';

type GapFixtures = {
  networkLog: NetworkEntry[];
};

/**
 * Extended Playwright test fixture for gap specs:
 * - Resets all local state before each test
 * - Captures network requests automatically
 * - Writes evidence artifacts after each test
 */
export const test = base.extend<GapFixtures>({
  networkLog: async ({ page }, use, testInfo) => {
    const log: NetworkEntry[] = [];

    // Navigate to app root and reset state
    await page.goto('/');
    await resetLocalState(page);

    // Set up network logging
    page.on('response', (response) => {
      log.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
      });
    });

    await use(log);

    // After test: capture evidence
    await captureEvidence(page, testInfo, log);
  },
});

export { expect } from '@playwright/test';
