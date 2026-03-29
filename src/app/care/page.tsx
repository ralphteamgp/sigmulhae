'use client';

import { TopNav } from '@/components/ui/top-nav';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Plant } from '@/types/plant';
import type { PlantSpecies } from '@/types/plant';
import { getPlantSpeciesById } from '@/lib/db/plant-data';

interface PlantWithSpecies extends Plant {
  species: PlantSpecies;
}

const CARE_MESSAGES = [
  { condition: 'thirsty', message: '나 요즘 좀 목말라… 물 한 번만 줄래?', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { condition: 'neglected', message: '요즘 나 잊은 거야? 나한테 할 말 없어?', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { condition: 'happy', message: '요즘 너 덕분에 잘 지내고 있어!', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
];

function getCareMessage(plant: PlantWithSpecies) {
  const daysSinceLastCare = Math.floor(
    (Date.now() - new Date(plant.lastCaredAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceLastCare > plant.species.waterIntervalDays * 2) return CARE_MESSAGES[1];
  if (daysSinceLastCare > plant.species.waterIntervalDays) return CARE_MESSAGES[0];
  return CARE_MESSAGES[2];
}

export default function CarePage() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantWithSpecies[]>([]);

  useEffect(() => {
    async function load() {
      const { db } = await import('@/lib/db');
      const allPlants = await db.plants.toArray();
      const withSpecies = allPlants
        .map((p) => {
          const species = getPlantSpeciesById(p.speciesId);
          if (!species) return null;
          return { ...p, species };
        })
        .filter((p): p is PlantWithSpecies => p !== null);
      setPlants(withSpecies);
    }
    load();
  }, []);

  const handleWater = async (plantId: string) => {
    const { createCareRecord } = await import('@/lib/db/care-record');
    const { updatePlant } = await import('@/lib/db/plant');
    await createCareRecord({ plantId, type: 'water', date: new Date() });
    await updatePlant(plantId, { lastCaredAt: new Date() });

    setPlants((prev) =>
      prev.map((p) =>
        p.id === plantId ? { ...p, lastCaredAt: new Date() } : p
      )
    );
  };

  return (
    <>
      <TopNav currentStep="care" />
      <main className="animate-fade-in-up mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">식물 상태 코멘트</h1>
        <p className="mt-2 text-sm text-slate-500">
          식물이 의인화된 말투로 현재 상태를 알려줘요
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant, i) => {
            const message = getCareMessage(plant);
            return (
              <div
                key={plant.id}
                className="animate-bob rounded-2xl border border-lime-200 bg-white p-5"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="text-center">
                  <div className="text-4xl">🌿</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-700">
                    {plant.species.name}
                  </h3>
                </div>

                <div className={`mt-4 rounded-xl border p-3 text-sm ${message.color}`}>
                  &ldquo;{message.message}&rdquo;
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleWater(plant.id)}
                    className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    💧 물주기
                  </button>
                  <button
                    onClick={() => router.push(`/care/records?plantId=${plant.id}`)}
                    className="flex-1 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    📋 기록
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {plants.length === 0 && (
          <div className="mt-12 text-center text-slate-400">
            <p>등록된 식물이 없어요</p>
            <button
              onClick={() => router.push('/plants')}
              className="mt-4 text-sm text-emerald-600 hover:underline"
            >
              식물 추천받으러 가기 →
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/care/records')}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
          >
            케어 기록 보기 →
          </button>
        </div>
      </main>
    </>
  );
}
