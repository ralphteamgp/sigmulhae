'use client';

import Link from 'next/link';
import { TopNav } from '@/components/ui/top-nav';
import { useEffect, useState } from 'react';
import type { Space } from '@/types/space';

export default function HomePage() {
  const [space, setSpace] = useState<Space | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSpace() {
      try {
        const { db } = await import('@/lib/db');
        const spaces = await db.spaces.orderBy('createdAt').reverse().toArray();
        if (spaces.length > 0) setSpace(spaces[0]);
      } catch {
        // IndexedDB 미지원 환경 → 무시
      }
      setLoaded(true);
    }
    loadSpace();
  }, []);

  const hasAnalysis = !!space;

  return (
    <>
      <TopNav />
      <main className="animate-fade-in-up mx-auto max-w-4xl px-6 py-10">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center text-center">
          {/* Decorative leaves */}
          <div className="animate-float pointer-events-none absolute -top-4 right-0 text-5xl opacity-30">
            🍃
          </div>
          <div className="animate-float-slow pointer-events-none absolute -bottom-8 left-0 text-4xl opacity-20">
            🌿
          </div>

          <div className="animate-sway mb-6 text-6xl">🌿</div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
            내 공간에 맞는 식물 찾아줄게요
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
            일조량 AI 분석으로 우리 집에 딱 맞는 식물을 추천받고
            <br />
            의인화된 케어로 식물과 함께 성장하세요
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analyze"
              className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
            >
              우리 집 분석하기
            </Link>
            <span className="px-4 py-3 text-sm text-slate-400">
              로그인 없이 시작하기
            </span>
          </div>
        </section>

        {/* Divider */}
        <hr className="my-12 border-lime-100" />

        {/* Result Area */}
        {loaded && (
          <section className="animate-fade-in-up">
            {hasAnalysis ? (
              <AnalysisResult space={space} />
            ) : (
              <EmptyResult />
            )}
          </section>
        )}
      </main>
    </>
  );
}

function EmptyResult() {
  return (
    <div className="rounded-2xl border border-dashed border-lime-200 bg-lime-50/50 p-8 text-center">
      <p className="text-lg font-medium text-slate-700">아직 분석된 공간이 없어요</p>
      <p className="mt-2 text-sm text-slate-400">
        우리 집을 분석하면 여기서 결과를 확인할 수 있어요
      </p>
      <Link
        href="/analyze"
        className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        우리 집 분석하기 →
      </Link>
    </div>
  );
}

function AnalysisResult({ space }: { space: Space }) {
  const gradeIcon = {
    strong: '☀️',
    medium: '🌤',
    weak: '🌥',
  };
  const gradeLabel = {
    strong: '강함',
    medium: '보통',
    weak: '약함',
  };

  return (
    <div className="rounded-2xl border border-lime-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">공간 채광 분석 결과</h2>
          <p className="mt-1 text-sm text-slate-500">
            {space.address ?? space.name}
            {space.dong && ` ${space.dong}`}
            {space.ho && ` ${space.ho}`}
          </p>
        </div>
        <Link href="/analyze" className="text-sm text-emerald-600 hover:underline">
          다시 분석하기
        </Link>
      </div>

      {/* Sunlight zones */}
      {space.sunlightZones.length > 0 && (
        <div className="mt-4 space-y-2">
          {space.sunlightZones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center gap-2 rounded-lg bg-lime-50 px-4 py-2 text-sm"
            >
              <span>{gradeIcon[zone.grade]}</span>
              <span className="font-medium text-slate-700">{gradeLabel[zone.grade]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Data source badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['건축물대장', '호갱노노 평면도', '방위각', 'SunCalc.js'].map((src) => (
          <span
            key={src}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            ✅ {src}
          </span>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/plants"
          className="inline-block rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
        >
          식물 추천받기 →
        </Link>
      </div>
    </div>
  );
}
