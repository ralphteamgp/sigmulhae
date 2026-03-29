'use client';

import Link from 'next/link';

interface StepInfo {
  label: string;
  completed: boolean;
  active: boolean;
}

const STEPS: Array<{ key: string; label: string }> = [
  { key: 'analysis', label: '분석완료' },
  { key: 'recommend', label: '식물추천' },
  { key: 'placement', label: '배치추천' },
  { key: 'care', label: '케어' },
];

export function TopNav({ currentStep }: { currentStep?: string }) {
  const showSteps = !!currentStep;

  const steps: StepInfo[] = STEPS.map((s, i) => {
    const currentIdx = STEPS.findIndex((st) => st.key === currentStep);
    return {
      label: s.label,
      completed: i < currentIdx,
      active: s.key === currentStep,
    };
  });

  return (
    <nav className="sticky top-0 z-50 border-b border-lime-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-800">
          <span className="animate-sway inline-block text-2xl">🌿</span>
          <span>식물식물해</span>
        </Link>

        {showSteps && (
          <div className="hidden items-center gap-2 text-sm sm:flex">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-lime-300">→</span>}
                <span
                  className={`flex items-center gap-1 ${
                    step.active
                      ? 'font-semibold text-emerald-700'
                      : step.completed
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      step.active
                        ? 'bg-emerald-600'
                        : step.completed
                          ? 'bg-emerald-500'
                          : 'bg-slate-300'
                    }`}
                  />
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
