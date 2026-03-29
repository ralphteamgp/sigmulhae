'use client';

import { TopNav } from '@/components/ui/top-nav';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Plant, CareRecord, PlantSpecies } from '@/types/plant';
import type { CareType } from '@/types/common';
import { getPlantSpeciesById } from '@/lib/db/plant-data';

export default function CareRecordsWrapper() {
  return (
    <Suspense>
      <CareRecordsPage />
    </Suspense>
  );
}

const CARE_TABS: Array<{ type: CareType; label: string; icon: string }> = [
  { type: 'water', label: '물주기', icon: '💧' },
  { type: 'repot', label: '분갈이', icon: '🪴' },
  { type: 'fertilize', label: '영양제', icon: '🌱' },
];

function CareRecordsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<CareType>('water');
  const [plant, setPlant] = useState<(Plant & { species: PlantSpecies }) | null>(null);
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    async function load() {
      const { db } = await import('@/lib/db');
      const plantId = params.get('plantId');

      let targetPlant: Plant | undefined;
      if (plantId) {
        targetPlant = await db.plants.get(plantId);
      } else {
        const allPlants = await db.plants.toArray();
        targetPlant = allPlants[0];
      }

      if (targetPlant) {
        const species = getPlantSpeciesById(targetPlant.speciesId);
        if (species) {
          setPlant({ ...targetPlant, species });
        }
        const careRecords = await db.careRecords
          .where('plantId')
          .equals(targetPlant.id)
          .reverse()
          .sortBy('date');
        setRecords(careRecords);
      }
    }
    load();
  }, [params]);

  const filteredRecords = records.filter((r) => r.type === activeTab);

  const handleAddRecord = async () => {
    if (!plant) return;
    const { createCareRecord } = await import('@/lib/db/care-record');
    await createCareRecord({
      plantId: plant.id,
      type: activeTab,
      date: new Date(),
      note: newNote || undefined,
    });

    // Reload records
    const { db } = await import('@/lib/db');
    const careRecords = await db.careRecords
      .where('plantId')
      .equals(plant.id)
      .reverse()
      .sortBy('date');
    setRecords(careRecords);
    setShowAddForm(false);
    setNewNote('');
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <>
      <TopNav currentStep="care" />
      <main className="animate-fade-in-up mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">케어 기록 & 성장 트래킹</h1>
        <p className="mt-2 text-sm text-slate-500">
          물주기·분갈이·영양제 기록을 탭별로 관리하세요
        </p>

        {plant && (
          <div className="mt-6 flex items-center gap-4">
            <span className="text-3xl">🌿</span>
            <div>
              <p className="font-semibold text-slate-800">{plant.species.name}</p>
              <p className="text-xs text-emerald-600">잘 자라고 있어요 ✓</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          {CARE_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.type
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-8 space-y-0">
          {filteredRecords.map((record, i) => (
            <div key={record.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                {i < filteredRecords.length - 1 && (
                  <div className="w-px flex-1 bg-emerald-200" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-sm font-medium text-slate-700">
                  {formatDate(record.date)}
                </p>
                <p className="text-xs text-slate-500">
                  {CARE_TABS.find((t) => t.type === record.type)?.label} 완료
                  {record.note && ` — ${record.note}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">
            아직 {CARE_TABS.find((t) => t.type === activeTab)?.label} 기록이 없어요
          </p>
        )}

        {/* Add record */}
        {showAddForm ? (
          <div className="mt-6 rounded-xl border border-lime-200 bg-white p-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="메모 (선택)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              rows={2}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAddRecord}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
              >
                기록 추가
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 w-full rounded-xl border-2 border-dashed border-lime-200 py-3 text-sm font-medium text-emerald-600 transition hover:border-emerald-300 hover:bg-lime-50"
          >
            + 케어 기록 추가
          </button>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push('/care')}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← 식물 상태로
          </button>
        </div>
      </main>
    </>
  );
}
