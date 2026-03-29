'use client';

import { TopNav } from '@/components/ui/top-nav';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Direction } from '@/types/common';
import type { AddressCandidate } from '@/types/api';

const DIRECTIONS: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const DIR_LABEL: Record<Direction, string> = {
  N: '북', NE: '북동', E: '동', SE: '남동',
  S: '남', SW: '남서', W: '서', NW: '북서',
};

export default function AnalyzePage() {
  const router = useRouter();

  // Address state
  const [addressQuery, setAddressQuery] = useState('');
  const [candidates, setCandidates] = useState<AddressCandidate[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [dong, setDong] = useState('');
  const [ho, setHo] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Photo state
  const [images, setImages] = useState<string[]>([]);
  const [aiDirection, setAiDirection] = useState<Direction | null>(null);
  const [directionConfirmed, setDirectionConfirmed] = useState(false);
  const [manualDirection, setManualDirection] = useState<Direction | null>(null);
  const [showDirectionPicker, setShowDirectionPicker] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Address search
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 2) { setCandidates([]); return; }
    setLoadingAddress(true);
    try {
      const res = await fetch('/api/analyze/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates ?? []);
      }
    } catch { /* ignore */ }
    setLoadingAddress(false);
  }, []);

  // Photo analysis state
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);

  // Analyze uploaded photos via API
  const analyzePhotos = useCallback(async (imageDataUrls: string[]) => {
    if (imageDataUrls.length === 0) return;
    setAnalyzingPhoto(true);
    try {
      const res = await fetch('/api/analyze/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imageDataUrls }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.windows && data.windows.length > 0) {
          setAiDirection(data.windows[0].direction as Direction);
          setAnalyzingPhoto(false);
          return;
        }
      }
      // API failed or no windows detected → show manual direction picker
      setShowDirectionPicker(true);
    } catch {
      // photo analysis failure → show manual direction picker as fallback
      setShowDirectionPicker(true);
    }
    setAnalyzingPhoto(false);
  }, []);

  // Photo upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - images.length;
    const toProcess = files.slice(0, remaining);

    const newImages: string[] = [];
    let processed = 0;

    for (const file of toProcess) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newImages.push(result);
        setImages((prev) => [...prev, result]);
        processed++;
        if (processed === toProcess.length) {
          analyzePhotos([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [images, analyzePhotos]);

  // Submit analysis
  const handleSubmit = async () => {
    if (!selectedAddress) return;
    setSubmitting(true);

    try {
      // Store analysis data and navigate to loading
      const params = new URLSearchParams({
        address: selectedAddress,
        ...(dong && { dong }),
        ...(ho && { ho }),
        ...(images.length > 0 && { hasPhotos: 'true' }),
        ...(manualDirection && { direction: manualDirection }),
      });

      // Store photos in sessionStorage for the loading page to use
      if (images.length > 0) {
        sessionStorage.setItem('analyze_photos', JSON.stringify(images));
      }

      router.push(`/analyze/loading?${params.toString()}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopNav />
      <main className="animate-fade-in-up mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">우리 집 분석하기</h1>
        <p className="mt-2 text-sm text-slate-500">
          주소를 입력해주세요. 대략적으로 입력해도 괜찮아요.
        </p>

        {/* Address Input */}
        <section className="mt-8 rounded-2xl border border-lime-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">주소 검색</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              필수
            </span>
          </div>

          <div className="relative mt-4">
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => {
                setAddressQuery(e.target.value);
                searchAddress(e.target.value);
              }}
              placeholder="예: 마포구 연남동 살아요"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {loadingAddress && (
              <div className="absolute right-3 top-3 h-5 w-5 animate-spin-slow rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            )}

            {candidates.length > 0 && !selectedAddress && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                {candidates.map((c, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setSelectedAddress(c.address);
                        setAddressQuery(c.address);
                        setCandidates([]);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-lime-50"
                    >
                      {c.address}
                      {c.jibunAddress && (
                        <span className="ml-2 text-xs text-slate-400">{c.jibunAddress}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <input
              type="text"
              value={dong}
              onChange={(e) => setDong(e.target.value)}
              placeholder="예: 101동"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400"
            />
            <input
              type="text"
              value={ho}
              onChange={(e) => setHo(e.target.value)}
              placeholder="예: 502호"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400"
            />
          </div>

          <p className="mt-3 text-xs text-slate-400">
            건축물대장 + 호갱노노 평면도 + 건축법령을 AI가 종합 분석합니다
          </p>
        </section>

        {/* Photo Upload */}
        <section className="mt-6 rounded-2xl border border-lime-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">창문 사진 업로드</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              선택
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            사진 첨부 시 창문 면적 보정으로 분석 정밀도 향상 (최대 5장)
          </p>

          <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-lime-200 bg-lime-50/30 p-8 transition hover:border-emerald-300 hover:bg-lime-50/60">
            <span className="text-3xl">🌿</span>
            <span className="mt-2 text-sm text-slate-500">창문이 보이는 방 사진</span>
            <span className="text-xs text-slate-400">클릭 또는 드래그하여 업로드</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="mt-4 flex gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-lime-200">
                  <img src={img} alt={`photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {Array.from({ length: 5 - images.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300">
                  +
                </div>
              ))}
            </div>
          )}

          {/* Photo analyzing indicator */}
          {analyzingPhoto && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">사진을 분석하고 있어요...</p>
            </div>
          )}

          {/* AI Direction Confirmation */}
          {aiDirection && !directionConfirmed && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-slate-700">
                이 창문은 <strong>{DIR_LABEL[aiDirection]}</strong>향으로 추정됩니다. 맞나요?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setDirectionConfirmed(true)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                >
                  네, 맞아요
                </button>
                <button
                  onClick={() => setShowDirectionPicker(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                >
                  아니요, 달라요
                </button>
              </div>
            </div>
          )}

          {showDirectionPicker && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {DIRECTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setManualDirection(d);
                    setDirectionConfirmed(true);
                    setShowDirectionPicker(false);
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    manualDirection === d
                      ? 'border-emerald-500 bg-emerald-50 font-medium text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  {DIR_LABEL[d]}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← 이전으로
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAddress || submitting}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? '분석 시작 중...' : '채광 분석 시작하기'}
          </button>
        </div>
      </main>
    </>
  );
}
