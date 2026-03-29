import { expect, test } from '@playwright/test';

test('homepage renders the workspace heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '식물식물해' })).toBeVisible();
  await expect(page.getByText('Ralphthon MVP bootstrap')).toBeVisible();
});
