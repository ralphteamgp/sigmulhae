import { getBrowser, closeBrowser } from './browser';

export interface CrawlResult {
  floorplanImage?: string;
  buildingAzimuth?: number;
  success: boolean;
  error?: string;
}

const PAGE_TIMEOUT_MS = 30_000;

/** 호갱노노에서 평면도 이미지 + 건물 방위 각도 크롤링 */
export async function crawlFloorplan(
  address: string
): Promise<CrawlResult> {
  let browser;

  try {
    browser = await getBrowser();
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    // 이미지 외 리소스 차단
    await context.route('**/*.{css,woff,woff2,ttf,eot}', (route: { abort: () => void }) => route.abort());

    const page = await context.newPage();
    page.setDefaultTimeout(PAGE_TIMEOUT_MS);

    // 호갱노노 검색
    await page.goto('https://hogangnono.com', { timeout: PAGE_TIMEOUT_MS });
    await page.waitForTimeout(1500);

    // 검색어 입력
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill(address);
    await page.waitForTimeout(2000);

    // 검색 결과 클릭 (첫 번째 결과)
    const firstResult = page.locator('.search-result-item, [class*="search"] a').first();
    if (await firstResult.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstResult.click();
      await page.waitForTimeout(2000);
    } else {
      await context.close();
      return { success: false, error: '검색 결과를 찾을 수 없습니다' };
    }

    // 평면도 이미지 추출 시도
    let floorplanImage: string | undefined;
    const imgLocator = page.locator('img[src*="floor"], img[src*="plan"], img[alt*="평면"]').first();

    if (await imgLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
      const imgSrc = await imgLocator.getAttribute('src');
      if (imgSrc) {
        try {
          const imgResponse = await page.request.get(imgSrc);
          const buffer = await imgResponse.body();
          floorplanImage = buffer.toString('base64');
        } catch {
          // 이미지 다운로드 실패 → 무시
        }
      }
    }

    // 건물 방위 각도 추출 시도 (나침반/방위 요소)
    let buildingAzimuth: number | undefined;
    const compassEl = page.locator('[class*="compass"], [class*="direction"], [data-azimuth]').first();
    if (await compassEl.isVisible({ timeout: 3000 }).catch(() => false)) {
      const azimuthStr = await compassEl.getAttribute('data-azimuth');
      if (azimuthStr) {
        buildingAzimuth = parseFloat(azimuthStr);
      }
    }

    await context.close();

    return {
      floorplanImage,
      buildingAzimuth,
      success: !!floorplanImage,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Crawling failed',
    };
  } finally {
    await closeBrowser().catch(() => {});
  }
}
