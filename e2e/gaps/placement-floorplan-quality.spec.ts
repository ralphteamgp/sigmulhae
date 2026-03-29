import { test, expect } from '../fixtures/gap-test';
import { seedAnalyzedSpace, seedAnalyzedSpaceWithFloorplan } from '../helpers/seed-analysis';

test.describe('배치 페이지 평면도 기반 기능 품질', () => {
  test('식물이 채광 조건에 따라 적합한 구역에 자동 배치되어야 한다', async ({
    page,
  }) => {
    await seedAnalyzedSpace(page);
    await page.goto('/plants');
    await expect(page.getByText('몬스테라')).toBeVisible({ timeout: 5000 });

    // 몬스테라(medium light) + 산세비에리아(weak light) 선택
    await page.getByText('몬스테라').first().click();
    await page.getByText('산세비에리아').first().click();
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(page.getByRole('heading', { name: '식물 배치 추천' })).toBeVisible();

    // 각 식물의 추천 위치 정보가 zone 기반으로 표시되어야 한다
    // 몬스테라(medium) → 간접광 구역 추천
    // 산세비에리아(weak) → 음지 구역도 OK
    await expect(page.getByText('간접광 구역').or(page.getByText('직사광 구역'))).toBeVisible();

    // 모든 배치된 식물에 대해 개별 추천 사유가 표시되어야 한다
    await expect(page.getByText('몬스테라')).toBeVisible();
    await expect(page.getByText('산세비에리아')).toBeVisible();
  });

  test('평면도 이미지가 있으면 배경에 선명하게 표시되어야 한다', async ({
    page,
  }) => {
    await seedAnalyzedSpaceWithFloorplan(page);
    await page.goto('/plants');
    await expect(page.getByText('몬스테라')).toBeVisible({ timeout: 5000 });
    await page.getByText('몬스테라').first().click();
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(page.getByRole('heading', { name: '식물 배치 추천' })).toBeVisible();

    // 평면도 이미지가 존재해야 한다
    const floorplanImg = page.locator('img[alt="평면도"]');
    await expect(floorplanImg).toBeVisible({ timeout: 3000 });
  });

  test('각 배치 식물 카드에 구역 및 추천 사유가 표시되어야 한다', async ({
    page,
  }) => {
    await seedAnalyzedSpace(page);
    await page.goto('/plants');
    await expect(page.getByText('몬스테라')).toBeVisible({ timeout: 5000 });

    await page.getByText('몬스테라').first().click();
    await page.getByText('산세비에리아').first().click();
    await page.getByRole('button', { name: '배치 추천 보기 →' }).click();
    await expect(page.getByRole('heading', { name: '식물 배치 추천' })).toBeVisible();

    // 식물 리스트에 구역 이름(직사광/간접광/음지)이 표시되어야 한다
    const zoneLabels = page.getByText('직사광').or(page.getByText('간접광')).or(page.getByText('음지'));
    await expect(zoneLabels.first()).toBeVisible();
  });
});
