export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between rounded-[2rem] border border-lime-100/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(61,122,70,0.12)] backdrop-blur lg:p-12">
        <header className="flex items-center justify-between gap-4 border-b border-lime-100 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-700">
              PlantFit Workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 lg:text-5xl">
              식물식물해
            </h1>
          </div>
          <div className="rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-sm font-medium text-lime-800">
            Ralphthon MVP bootstrap
          </div>
        </header>

        <section className="grid gap-8 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:py-16">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
              Next.js 15 + React 19 + Tailwind CSS 4
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 lg:text-6xl">
              내 공간에 맞는 식물 추천 흐름을 위한 기반 환경이 준비됐습니다.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              App Router, 타입스크립트 strict 모드, 테스트 툴체인, 그리고 단계별 기능 확장을 위한
              디렉토리 구조를 한 번에 시작할 수 있는 초기 화면입니다.
            </p>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-emerald-100 bg-emerald-950 p-5 text-emerald-50 shadow-[0_20px_60px_rgba(17,94,89,0.25)]">
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-emerald-200">Step 1</p>
              <p className="mt-2 text-lg font-semibold">프로젝트 초기 설정</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-emerald-200">Step 2</p>
              <p className="mt-2 text-lg font-semibold">공유 타입과 분석 API 구현</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-sm text-emerald-200">Step 3</p>
              <p className="mt-2 text-lg font-semibold">채광 계산과 식물 추천 흐름 연결</p>
            </div>
          </div>
        </section>

        <footer className="grid gap-3 border-t border-lime-100 pt-6 text-sm text-slate-600 lg:grid-cols-3">
          <div className="rounded-2xl bg-lime-50 px-4 py-3">주소 분석, 평면도 크롤링, 사진 분석 API용 경로 스캐폴딩 포함</div>
          <div className="rounded-2xl bg-lime-50 px-4 py-3">Vitest와 Playwright 샘플 검증 경로 포함</div>
          <div className="rounded-2xl bg-lime-50 px-4 py-3">후속 태스크를 위한 `@/` alias 및 strict TypeScript 설정 포함</div>
        </footer>
      </div>
    </main>
  );
}
