'use client';

import { TopNav } from '@/components/ui/top-nav';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PlantSpecies } from '@/types/plant';
import { loadPlantSpecies } from '@/lib/db/plant-data';

export default function PlantsPage() {
  const router = useRouter();
  const [beginnerOnly, setBeginnerOnly] = useState(true);
  const [plants, setPlants] = useState<PlantSpecies[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allPlants = loadPlantSpecies();
    setPlants(allPlants);
  }, []);

  const filtered = plants.filter((p) => {
    if (beginnerOnly && p.difficulty !== 'easy') return false;
    if (searchQuery && !p.name.includes(searchQuery) && !p.scientificName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePlacement = () => {
    sessionStorage.setItem('selected_plants', JSON.stringify([...selected]));
    router.push('/plants/placement');
  };

  const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' };
  const difficultyColor = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <TopNav currentStep="recommend" />
      <main className="animate-fade-in-up mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">식물 추천 리스트</h1>
        <p className="mt-2 text-sm text-slate-500">
          채광 등급 기반으로 우리 집에 맞는 식물을 추천해드려요
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setBeginnerOnly(!beginnerOnly)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              beginnerOnly
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span className={`inline-block h-3 w-3 rounded-full transition ${beginnerOnly ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            키우기 쉬운 것만 보기
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((plant) => (
            <button
              key={plant.id}
              onClick={() => toggleSelect(plant.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selected.has(plant.id)
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-transparent bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <div className="text-3xl">🌿</div>
              <h3 className="mt-2 font-semibold text-slate-800">{plant.name}</h3>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[plant.difficulty]}`}>
                {difficultyLabel[plant.difficulty]}
              </span>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                {plant.description}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6">
          <p className="text-sm text-slate-500">추천 외 식물도 직접 검색해서 등록할 수 있어요</p>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="식물 이름 검색..."
            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-sm text-slate-500 hover:text-slate-700">
            ← 채광 결과로
          </button>
          <button
            onClick={handlePlacement}
            disabled={selected.size === 0}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
          >
            배치 추천 보기 →
          </button>
        </div>
      </main>
    </>
  );
}
