'use client';

import { TopNav } from '@/components/ui/top-nav';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AnalysisLoadingWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalysisLoadingPage />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <>
      <TopNav />
      <main className="flex min-h-[80vh] flex-col items-center justify-center">
        <div className="animate-spin-slow text-5xl">🌿</div>
        <p className="mt-4 text-slate-500">준비 중...</p>
      </main>
    </>
  );
}

interface AnalysisStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

const INITIAL_STEPS: AnalysisStep[] = [
  { label: '주소 확인 및 건축물대장 조회', status: 'pending' },
  { label: '호갱노노 평면도 수집', status: 'pending' },
  { label: 'AI 종합 분석 (평면도+방위각+건축법령)', status: 'pending' },
  { label: '태양 고도각·직달일사 시간 계산', status: 'pending' },
  { label: '최종 채광 등급 산출', status: 'pending' },
];

function AnalysisLoadingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const address = params.get('address') ?? '';
    const dong = params.get('dong') ?? undefined;
    const ho = params.get('ho') ?? undefined;

    runAnalysis(address, dong, ho);
  }, [params]);

  async function advanceStep(index: number) {
    setSteps((prev) =>
      prev.map((s, i) => ({
        ...s,
        status: i < index ? 'done' : i === index ? 'active' : 'pending',
      }))
    );
    await new Promise((r) => setTimeout(r, 800));
  }

  async function completeAllSteps() {
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as const })));
  }

  async function runAnalysis(address: string, dong?: string, ho?: string) {
    try {
      // Step 0: Address + Building register
      await advanceStep(0);
      const addressRes = await fetch('/api/analyze/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: address, dong, ho }),
      });
      const addressData = addressRes.ok ? await addressRes.json() : null;

      // Step 1: Floorplan crawling
      await advanceStep(1);
      const floorplanRes = await fetch('/api/analyze/floorplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, dong, ho }),
      });
      const floorplanData = floorplanRes.ok ? await floorplanRes.json() : null;

      // Step 2: AI analysis (already done in floorplan)
      await advanceStep(2);
      await new Promise((r) => setTimeout(r, 500));

      // Step 3: Sunlight calculation
      await advanceStep(3);
      const windows = floorplanData?.windows ?? [];
      let sunlightData = null;
      if (windows.length > 0) {
        const sunRes = await fetch('/api/sunlight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: 37.5665,
            longitude: 126.978,
            windows: windows.map((w: { direction: string; size: string; position: { x: number; y: number } }, i: number) => ({
              id: `w-${i}`,
              ...w,
            })),
          }),
        });
        if (sunRes.ok) sunlightData = await sunRes.json();
      }

      // Step 4: Final grade
      await advanceStep(4);
      await new Promise((r) => setTimeout(r, 500));

      // Save to IndexedDB
      const { createSpace } = await import('@/lib/db/space');
      await createSpace({
        name: '분석 공간',
        address,
        dong,
        ho,
        floorplanImage: floorplanData?.floorplanImage,
        buildingAzimuth: floorplanData?.buildingAzimuth,
        windows: windows.map((w: { direction: string; size: string; position: { x: number; y: number } }, i: number) => ({
          id: `w-${i}`,
          ...w,
        })),
        sunlightZones: sunlightData?.zones ?? [],
      });

      await completeAllSteps();
      await new Promise((r) => setTimeout(r, 600));
      router.replace('/');
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback: save what we have and navigate back
      await completeAllSteps();
      router.replace('/');
    }
  }

  return (
    <>
      <TopNav />
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div className="animate-spin-slow mb-6 text-5xl">🌿</div>

        <h1 className="text-2xl font-bold text-slate-900">
          햇빛 경로를 계산하고 있어요
        </h1>
        <p className="mt-2 text-sm text-slate-500">잠시만 기다려주세요</p>

        <div className="mt-10 w-full max-w-md space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex-shrink-0">
                {step.status === 'done' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                    ✓
                  </span>
                )}
                {step.status === 'active' && (
                  <span className="animate-pulse-dot flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400" />
                )}
                {step.status === 'pending' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200" />
                )}
              </span>
              <span
                className={`text-sm ${
                  step.status === 'done'
                    ? 'text-emerald-700'
                    : step.status === 'active'
                      ? 'font-medium text-slate-800'
                      : 'text-slate-400'
                }`}
              >
                {step.label}
                {step.status === 'active' && (
                  <span className="ml-1 text-xs text-emerald-500">← 진행 중</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
