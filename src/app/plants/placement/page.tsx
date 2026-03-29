'use client';

import { TopNav } from '@/components/ui/top-nav';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PlantSpecies } from '@/types/plant';
import type { Space } from '@/types/space';
import { getPlantSpeciesById } from '@/lib/db/plant-data';

interface PlacedPlant {
  speciesId: string;
  species: PlantSpecies;
  x: number;
  y: number;
  zone: 'good' | 'warning';
}

export default function PlacementPage() {
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [placed, setPlaced] = useState<PlacedPlant[]>([]);
  const [swept, setSwept] = useState(false);

  useEffect(() => {
    async function load() {
      // Load space from IndexedDB
      const { db } = await import('@/lib/db');
      const spaces = await db.spaces.orderBy('createdAt').reverse().toArray();
      if (spaces.length > 0) setSpace(spaces[0]);

      // Load selected plants
      const raw = sessionStorage.getItem('selected_plants');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const plants: PlacedPlant[] = ids
          .map((id, i) => {
            const species = getPlantSpeciesById(id);
            if (!species) return null;
            return {
              speciesId: id,
              species,
              x: 20 + (i % 3) * 30,
              y: 20 + Math.floor(i / 3) * 30,
              zone: species.sunlightNeed === 'weak' ? 'warning' as const : 'good' as const,
            };
          })
          .filter((p): p is PlacedPlant => p !== null);
        setPlaced(plants);
      }
    }
    load();

    // Trigger sweep animation
    const timer = setTimeout(() => setSwept(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const removePlant = (idx: number) => {
    setPlaced((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCareStart = async () => {
    // Register plants in DB
    const { createPlant } = await import('@/lib/db/plant');
    const spaceId = space?.id ?? 'default';
    for (const p of placed) {
      await createPlant({
        speciesId: p.speciesId,
        spaceId,
        position: { x: p.x, y: p.y },
      });
    }
    router.push('/care');
  };

  return (
    <>
      <TopNav currentStep="placement" />
      <main className="animate-fade-in-up mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">식물 배치 추천</h1>
        <p className="mt-2 text-sm text-slate-500">
          햇빛이 집 안을 스캔하며 최적 자리를 찾아드려요
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* 2D Floorplan */}
          <div className="relative overflow-hidden rounded-2xl border border-lime-200 bg-white p-4">
            {/* Sweep animation */}
            {!swept && (
              <div className="animate-sweep absolute inset-0 z-10 bg-gradient-to-r from-amber-200/60 via-yellow-100/40 to-transparent" />
            )}

            <div className="relative h-80 rounded-xl bg-gradient-to-br from-lime-50 to-white">
              {/* Room layout */}
              <div className="absolute left-4 top-4 h-48 w-48 rounded-lg border-2 border-slate-300 bg-white/50 p-2">
                <span className="text-xs text-slate-400">거실</span>
              </div>
              <div className="absolute right-4 top-4 h-24 w-24 rounded-lg border-2 border-slate-300 bg-white/50 p-2">
                <span className="text-xs text-slate-400">침실</span>
              </div>
              <div className="absolute bottom-4 right-4 h-20 w-24 rounded-lg border-2 border-slate-300 bg-white/50 p-2">
                <span className="text-xs text-slate-400">주방</span>
              </div>

              {/* Plant pins */}
              {placed.map((p, i) => (
                <div
                  key={i}
                  className={`absolute flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
                    p.zone === 'good'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-red-400 bg-red-50'
                  }`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  🌿
                </div>
              ))}
            </div>

            {swept && placed.length > 0 && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                <strong>✦ Best Spot</strong> — 거실 창가
                <p className="mt-1 text-xs text-slate-500">
                  {placed[0]?.species.name}은(는) 거실 창가 왼쪽이 딱 맞아요.
                  직사광선보다 밝은 간접광이 드는 이 자리를 추천합니다.
                </p>
              </div>
            )}

            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                그린 — 햇빛 양호 구역
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                레드 — 음지 구역
              </span>
            </div>
          </div>

          {/* Placed plants list */}
          <div className="rounded-2xl border border-lime-200 bg-white p-4">
            <h2 className="font-semibold text-slate-800">배치된 식물 리스트</h2>
            <div className="mt-4 space-y-3">
              {placed.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌿</span>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{p.species.name}</p>
                      <p className="text-xs text-slate-400">거실</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        p.zone === 'good' ? 'bg-emerald-500' : 'bg-red-400'
                      }`}
                    />
                    <button
                      onClick={() => removePlant(i)}
                      className="text-sm text-slate-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {placed.length === 0 && (
              <p className="mt-4 text-center text-sm text-slate-400">배치된 식물이 없어요</p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              평면도에서 식물을 드래그해 배치를 조정할 수 있어요
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => router.push('/plants')} className="text-sm text-slate-500">
            ← 추천 리스트로
          </button>
          <button
            onClick={handleCareStart}
            disabled={placed.length === 0}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
          >
            케어 시작하기 →
          </button>
        </div>
      </main>
    </>
  );
}
