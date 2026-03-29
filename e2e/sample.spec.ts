import { expect, test } from '@playwright/test';

test('homepage renders the landing hero', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '내 공간에 맞는 식물 찾아줄게요' })).toBeVisible();
  await expect(page.getByRole('link', { name: '우리 집 분석하기' }).first()).toBeVisible();
});

test('navigate to analyze page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '우리 집 분석하기' }).first().click();
  await expect(page.getByRole('heading', { name: '우리 집 분석하기' })).toBeVisible();
});

test('plants page renders', async ({ page }) => {
  await page.goto('/plants');
  await expect(page.getByRole('heading', { name: '식물 추천 리스트' })).toBeVisible();
});

test('care page renders', async ({ page }) => {
  await page.goto('/care');
  await expect(page.getByRole('heading', { name: '식물 상태 코멘트' })).toBeVisible();
});
