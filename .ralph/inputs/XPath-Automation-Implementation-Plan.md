# PlantFit XPath Automation Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local web demo that runs the PRD section `2.2` Hogangnono XPath automation flow and shows collected evidence for orientation, floorplan, and sunlight extraction on screen.

**Architecture:** Use a single TypeScript workspace with a Vite React frontend and an Express backend. The frontend acts as a verification console, while the backend runs Playwright collectors that use the XPath values defined in `PlantFit_PRD_v1.3.md` and returns normalized results plus screenshot evidence.

**Tech Stack:** React, Vite, TypeScript, Express, Playwright, Vitest, Testing Library, existing `planterier-wireframe.css`

---

### Task 1: Scaffold the app and toolchain

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/app.css`
- Create: `server/index.ts`
- Create: `server/app.ts`

**Step 1: Write the failing smoke test for frontend boot**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the automation console title', () => {
    render(<App />);
    expect(screen.getByText('PlantFit XPath Automation Console')).toBeInTheDocument();
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- src/App.test.tsx`

Expected: FAIL because dependencies and files do not exist yet.

**Step 3: Create the minimal workspace files**

Add `package.json` scripts and dependencies:

```json
{
  "name": "plantfit-xpath-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:web\"",
    "dev:web": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "vite build && tsc -p tsconfig.node.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "playwright:install": "playwright install chromium"
  },
  "dependencies": {
    "express": "^5.1.0",
    "playwright": "^1.54.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/express": "^5.0.3",
    "@types/node": "^24.0.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "concurrently": "^9.1.2",
    "tsx": "^4.20.0",
    "typescript": "^5.8.3",
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

Create minimal `src/App.tsx`:

```tsx
export default function App() {
  return <h1>PlantFit XPath Automation Console</h1>;
}
```

Create `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';
import '../planterier-wireframe.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create minimal `server/app.ts`:

```ts
import express from 'express';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  return app;
}
```

Create `server/index.ts`:

```ts
import { createApp } from './app';

const port = Number(process.env.PORT ?? 3001);
createApp().listen(port, () => {
  console.log(`server listening on ${port}`);
});
```

**Step 4: Run the test to verify it passes**

Run: `npm run test -- src/App.test.tsx`

Expected: PASS with one passing test.

**Step 5: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html src/main.tsx src/App.tsx src/app.css src/App.test.tsx server/index.ts server/app.ts
git commit -m "chore: scaffold plantfit xpath demo"
```

### Task 2: Define the shared result contract and PRD XPath constants

**Files:**
- Create: `src/types/automation.ts`
- Create: `server/automation/xpaths.ts`
- Create: `server/automation/types.ts`
- Test: `server/automation/xpaths.test.ts`

**Step 1: Write the failing test for PRD XPath constants**

Create `server/automation/xpaths.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PRD_XPATHS } from './xpaths';

describe('PRD_XPATHS', () => {
  it('contains the orientation collector XPath list from the PRD', () => {
    expect(PRD_XPATHS.orientation.searchInput).toContain('/html/body/div[2]/div[1]/div[1]');
  });

  it('contains the sunlight canvas XPath from the PRD', () => {
    expect(PRD_XPATHS.sunlight.canvas).toContain('/canvas');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/automation/xpaths.test.ts`

Expected: FAIL because the constants file does not exist.

**Step 3: Add the shared types and XPath constants**

Create `server/automation/xpaths.ts` with a constant object that copies the XPath values from PRD section `2.2`.

Shape:

```ts
export const PRD_XPATHS = {
  orientation: {
    searchInput: '...',
    complexArea: '...',
    buildingPath: '...'
  },
  floorplan: {
    searchInput: '...',
    unitToggle: '...',
    unitList: '...',
    unitItem: '...',
    image: '...'
  },
  sunlight: {
    searchInput: '...',
    searchResult: '...',
    section: '...',
    openButton: '...',
    canvas: '...',
    timeSlider: '...',
    seasonList: '...',
    seasonControl: '...'
  }
} as const;
```

Create a normalized run result type in `src/types/automation.ts` and mirror the same backend type in `server/automation/types.ts`.

**Step 4: Run the test to verify it passes**

Run: `npm run test -- server/automation/xpaths.test.ts`

Expected: PASS with two passing tests.

**Step 5: Commit**

```bash
git add src/types/automation.ts server/automation/xpaths.ts server/automation/types.ts server/automation/xpaths.test.ts
git commit -m "feat: add prd xpath contract"
```

### Task 3: Add the automation API route with a mocked response first

**Files:**
- Modify: `server/app.ts`
- Create: `server/routes/automation.ts`
- Test: `server/routes/automation.test.ts`

**Step 1: Write the failing API test**

Create `server/routes/automation.test.ts`:

```ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';

describe('POST /api/automation/run', () => {
  it('returns a normalized run result for an address', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/automation/run')
      .send({ address: '서울시 성동구 성수동 테스트' });

    expect(response.status).toBe(200);
    expect(response.body.input.address).toBe('서울시 성동구 성수동 테스트');
    expect(response.body.orientation.status).toBe('skipped');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/routes/automation.test.ts`

Expected: FAIL because the route does not exist and `supertest` is not installed.

**Step 3: Implement the route with a stubbed result**

Install `supertest` and types, then create `server/routes/automation.ts`:

```ts
import { Router } from 'express';

export const automationRouter = Router();

automationRouter.post('/run', (req, res) => {
  const address = String(req.body.address ?? '');
  res.json({
    runMeta: {
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      overallStatus: 'failed'
    },
    input: { address },
    orientation: { status: 'skipped', xpaths: [], elementFound: false, raw: {}, computedAngle: null, screenshots: [], error: null },
    floorplan: { status: 'skipped', xpaths: [], availableUnits: [], selectedUnit: null, imageUrl: null, screenshots: [], error: null },
    sunlight: { status: 'skipped', xpaths: [], viewerOpened: false, canvasDetected: false, captures: [], screenshots: [], error: null },
    logs: []
  });
});
```

Wire it in `server/app.ts`:

```ts
import { automationRouter } from './routes/automation';

app.use('/api/automation', automationRouter);
```

**Step 4: Run the test to verify it passes**

Run: `npm run test -- server/routes/automation.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/app.ts server/routes/automation.ts server/routes/automation.test.ts package.json
git commit -m "feat: add automation api stub"
```

### Task 4: Build the automation runner and browser factory

**Files:**
- Create: `server/automation/browser.ts`
- Create: `server/automation/runAutomation.ts`
- Create: `server/automation/resultFactory.ts`
- Test: `server/automation/runAutomation.test.ts`

**Step 1: Write the failing runner test**

Create `server/automation/runAutomation.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { runAutomation } from './runAutomation';

describe('runAutomation', () => {
  it('returns partial when one collector succeeds and another fails', async () => {
    const result = await runAutomation({
      address: '테스트 주소',
      collectors: {
        orientation: vi.fn().mockResolvedValue({ status: 'success' }),
        floorplan: vi.fn().mockResolvedValue({ status: 'failed' }),
        sunlight: vi.fn().mockResolvedValue({ status: 'skipped' })
      }
    } as any);

    expect(result.runMeta.overallStatus).toBe('partial');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/automation/runAutomation.test.ts`

Expected: FAIL because runner files do not exist.

**Step 3: Implement the runner and result factory**

Key behavior for `server/automation/runAutomation.ts`:
- accept `address`
- open a Playwright page through `browser.ts`
- call collectors in sequence
- aggregate logs and timings
- compute overall status as `success`, `partial`, or `failed`

Minimal status logic:

```ts
function getOverallStatus(statuses: string[]) {
  if (statuses.every((value) => value === 'success')) return 'success';
  if (statuses.some((value) => value === 'success')) return 'partial';
  return 'failed';
}
```

Create a simple `browser.ts` with `launchChromium()` and `closeBrowser()` wrappers so Playwright startup is isolated from collector logic.

**Step 4: Run the test to verify it passes**

Run: `npm run test -- server/automation/runAutomation.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/automation/browser.ts server/automation/runAutomation.ts server/automation/resultFactory.ts server/automation/runAutomation.test.ts
git commit -m "feat: add automation runner shell"
```

### Task 5: Implement the orientation collector first

**Files:**
- Create: `server/automation/collectors/orientationCollector.ts`
- Create: `server/automation/parsers/orientationParser.ts`
- Test: `server/automation/parsers/orientationParser.test.ts`
- Test: `server/automation/collectors/orientationCollector.test.ts`

**Step 1: Write the failing parser test**

Create `server/automation/parsers/orientationParser.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseOrientationFromPath } from './orientationParser';

describe('parseOrientationFromPath', () => {
  it('returns a number when a path d attribute is provided', () => {
    const angle = parseOrientationFromPath('M 0 0 L 10 10');
    expect(typeof angle).toBe('number');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/automation/parsers/orientationParser.test.ts`

Expected: FAIL because parser file does not exist.

**Step 3: Write the minimal parser and collector**

Parser example:

```ts
export function parseOrientationFromPath(d: string): number | null {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length < 4) return null;
  const [x1, y1, x2, y2] = numbers;
  return Math.round((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI);
}
```

Collector responsibilities:
- use PRD orientation XPath values
- fill the address input
- wait for the target SVG path
- extract `d` and `style`
- save a screenshot to `artifacts/orientation/`
- return normalized collector output

**Step 4: Add a collector unit test with a mocked page**

Create `server/automation/collectors/orientationCollector.test.ts` with a mocked Playwright page that verifies:
- the collector uses `PRD_XPATHS.orientation.buildingPath`
- `status` is `success` when raw values are returned

Run: `npm run test -- server/automation/parsers/orientationParser.test.ts server/automation/collectors/orientationCollector.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/automation/collectors/orientationCollector.ts server/automation/parsers/orientationParser.ts server/automation/parsers/orientationParser.test.ts server/automation/collectors/orientationCollector.test.ts
git commit -m "feat: add orientation collector"
```

### Task 6: Implement the floorplan collector

**Files:**
- Create: `server/automation/collectors/floorplanCollector.ts`
- Test: `server/automation/collectors/floorplanCollector.test.ts`

**Step 1: Write the failing collector test**

Create `server/automation/collectors/floorplanCollector.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { floorplanCollector } from './floorplanCollector';

describe('floorplanCollector', () => {
  it('returns the selected unit and image url', async () => {
    const result = await floorplanCollector({
      page: {} as any,
      address: '테스트 주소',
      selectedUnit: '84A'
    });

    expect(result.status).toBe('success');
    expect(result.selectedUnit).toBe('84A');
    expect(result.imageUrl).toContain('http');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/automation/collectors/floorplanCollector.test.ts`

Expected: FAIL because collector file does not exist.

**Step 3: Implement the collector**

Collector responsibilities:
- use `2.2.2` PRD XPath values
- search the address
- open the unit selection list
- collect the rendered unit labels
- match the selected unit or fall back to the first item
- extract the floorplan image URL
- capture screenshots to `artifacts/floorplan/`

Return shape:

```ts
{
  status: 'success',
  xpaths: [...],
  availableUnits: ['84A', '84B'],
  selectedUnit: '84A',
  imageUrl: 'https://...',
  screenshots: ['artifacts/floorplan/step-1.png'],
  error: null
}
```

**Step 4: Run the test to verify it passes**

Run: `npm run test -- server/automation/collectors/floorplanCollector.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/automation/collectors/floorplanCollector.ts server/automation/collectors/floorplanCollector.test.ts
git commit -m "feat: add floorplan collector"
```

### Task 7: Implement the sunlight collector

**Files:**
- Create: `server/automation/collectors/sunlightCollector.ts`
- Test: `server/automation/collectors/sunlightCollector.test.ts`

**Step 1: Write the failing collector test**

Create `server/automation/collectors/sunlightCollector.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { sunlightCollector } from './sunlightCollector';

describe('sunlightCollector', () => {
  it('returns at least one capture when the canvas is found', async () => {
    const result = await sunlightCollector({
      page: {} as any,
      address: '테스트 주소'
    });

    expect(result.status).toBe('success');
    expect(result.canvasDetected).toBe(true);
    expect(result.captures.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/automation/collectors/sunlightCollector.test.ts`

Expected: FAIL because collector file does not exist.

**Step 3: Implement the collector**

Collector responsibilities:
- use `2.2.3` PRD XPath values
- enter the search result
- scroll to the sunlight section
- click the 3D viewer button
- wait for the canvas
- capture at least one screenshot
- if stable, loop over season/time controls and collect additional screenshots

Capture record shape:

```ts
{
  season: 'spring',
  timeSlot: 'noon',
  screenshot: 'artifacts/sunlight/spring-noon.png'
}
```

**Step 4: Run the test to verify it passes**

Run: `npm run test -- server/automation/collectors/sunlightCollector.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/automation/collectors/sunlightCollector.ts server/automation/collectors/sunlightCollector.test.ts
git commit -m "feat: add sunlight collector"
```

### Task 8: Wire the real runner into the API and save artifacts

**Files:**
- Modify: `server/routes/automation.ts`
- Create: `server/automation/artifacts.ts`
- Modify: `server/automation/runAutomation.ts`
- Test: `server/routes/automation.integration.test.ts`

**Step 1: Write the failing integration test**

Create `server/routes/automation.integration.test.ts`:

```ts
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';

vi.mock('../automation/runAutomation', () => ({
  runAutomation: vi.fn().mockResolvedValue({
    runMeta: { overallStatus: 'partial', startedAt: '', finishedAt: '', durationMs: 1234 },
    input: { address: '테스트 주소' },
    orientation: { status: 'success', xpaths: ['/html/...'], elementFound: true, raw: {}, computedAngle: 90, screenshots: ['a.png'], error: null },
    floorplan: { status: 'failed', xpaths: ['/html/...'], availableUnits: [], selectedUnit: null, imageUrl: null, screenshots: [], error: 'not found' },
    sunlight: { status: 'skipped', xpaths: ['/html/...'], viewerOpened: false, canvasDetected: false, captures: [], screenshots: [], error: null },
    logs: []
  })
}));

describe('automation route integration', () => {
  it('uses runAutomation and returns its output', async () => {
    const response = await request(createApp()).post('/api/automation/run').send({ address: '테스트 주소' });
    expect(response.status).toBe(200);
    expect(response.body.runMeta.overallStatus).toBe('partial');
    expect(response.body.orientation.status).toBe('success');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- server/routes/automation.integration.test.ts`

Expected: FAIL because the route still returns a hard-coded stub.

**Step 3: Replace the stub with the real runner**

Route behavior:
- validate `address`
- call `runAutomation({ address })`
- return the result
- on exception, return a normalized failed result with an error log

Add `server/automation/artifacts.ts` helpers:

```ts
export async function ensureArtifactDir(name: string) {
  const dir = new URL(`../../artifacts/${name}/`, import.meta.url);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
```

**Step 4: Run the integration test to verify it passes**

Run: `npm run test -- server/routes/automation.integration.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/routes/automation.ts server/automation/artifacts.ts server/automation/runAutomation.ts server/routes/automation.integration.test.ts
git commit -m "feat: wire automation runner into api"
```

### Task 9: Build the frontend run dashboard and collector cards

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/RunForm.tsx`
- Create: `src/components/CollectorCard.tsx`
- Create: `src/components/StatusBadge.tsx`
- Test: `src/components/RunForm.test.tsx`

**Step 1: Write the failing form test**

Create `src/components/RunForm.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RunForm } from './RunForm';

describe('RunForm', () => {
  it('submits the address entered by the user', () => {
    const onSubmit = vi.fn();
    render(<RunForm onSubmit={onSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText('주소'), { target: { value: '서울 성동구' } });
    fireEvent.click(screen.getByRole('button', { name: '자동화 실행' }));

    expect(onSubmit).toHaveBeenCalledWith('서울 성동구');
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- src/components/RunForm.test.tsx`

Expected: FAIL because the component does not exist.

**Step 3: Implement the dashboard UI**

Build `src/App.tsx` with:
- page title
- address form
- overall status section
- three collector summary cards

Use `planterier-wireframe.css` classes where they help readability, for example:
- `.wf-card`
- `.wf-btn`
- `.wf-input`
- `.wf-section-label`

Do not chase visual polish. Keep the page readable and operational.

**Step 4: Run the test to verify it passes**

Run: `npm run test -- src/components/RunForm.test.tsx src/App.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/App.tsx src/components/RunForm.tsx src/components/CollectorCard.tsx src/components/StatusBadge.tsx src/components/RunForm.test.tsx
git commit -m "feat: add automation dashboard ui"
```

### Task 10: Add result panels, logs, and frontend API wiring

**Files:**
- Modify: `src/App.tsx`
- Create: `src/lib/api.ts`
- Create: `src/components/ResultPanel.tsx`
- Create: `src/components/LogPanel.tsx`
- Test: `src/lib/api.test.ts`

**Step 1: Write the failing API client test**

Create `src/lib/api.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { runAutomation } from './api';

describe('runAutomation api', () => {
  it('posts the address to the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    await runAutomation('서울 성동구');

    expect(fetchMock).toHaveBeenCalledWith('/api/automation/run', expect.objectContaining({ method: 'POST' }));
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- src/lib/api.test.ts`

Expected: FAIL because the API helper does not exist.

**Step 3: Implement the client and detailed panels**

Create `src/lib/api.ts`:

```ts
export async function runAutomation(address: string) {
  const response = await fetch('/api/automation/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return response.json();
}
```

Update `src/App.tsx` to:
- call the API helper on submit
- store loading and result state
- render detailed orientation, floorplan, and sunlight panels
- render ordered execution logs
- show XPath values, screenshot paths, raw data summaries, and errors

**Step 4: Run the tests to verify they pass**

Run: `npm run test -- src/lib/api.test.ts src/components/RunForm.test.tsx src/App.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/App.tsx src/lib/api.ts src/lib/api.test.ts src/components/ResultPanel.tsx src/components/LogPanel.tsx
git commit -m "feat: show automation results and logs"
```

### Task 11: Add manual verification steps and live-run safeguards

**Files:**
- Create: `README.md`
- Modify: `package.json`
- Create: `.env.example`

**Step 1: Write the failing documentation checklist item**

Create a checklist in `README.md` that is initially empty except for these headings:

```md
# PlantFit XPath Automation Demo

## Setup

## Run locally

## What to verify in the UI
```

**Step 2: Run a build to identify missing scripts or config**

Run: `npm run build`

Expected: likely FAIL at first due to missing Vite or TypeScript configuration issues. Fix only what is needed to support the documented flow.

**Step 3: Fill in the README and environment contract**

Document:
- `npm install`
- `npm run playwright:install`
- `npm run dev`
- required environment values such as `HOGANGNONO_BASE_URL` and `PLAYWRIGHT_HEADLESS`
- how to validate each collector in the web UI
- where screenshots are saved under `artifacts/`

Create `.env.example`:

```env
HOGANGNONO_BASE_URL=https://hogangnono.com
PLAYWRIGHT_HEADLESS=true
PORT=3001
```

**Step 4: Run the full verification commands**

Run:
- `npm run test`
- `npm run build`

Expected: both commands PASS.

**Step 5: Commit**

```bash
git add README.md package.json .env.example
git commit -m "docs: add local verification guide"
```

### Task 12: Final live smoke check against the PRD XPath flow

**Files:**
- Modify as needed: `server/automation/collectors/*.ts`
- Review only: `PlantFit_PRD_v1.3.md`

**Step 1: Run the app locally**

Run: `npm run dev`

Expected: frontend and backend both start successfully.

**Step 2: Perform one manual live run from the browser**

Manual checks:
- enter a real address
- click `자동화 실행`
- verify each collector card changes state
- confirm the displayed XPath values match PRD section `2.2`
- confirm at least one screenshot or artifact path appears

**Step 3: Fix only the blockers revealed by the live run**

Examples:
- incorrect waits
- wrong scroll timing
- missing screenshot capture
- route proxy issues between Vite and Express

**Step 4: Re-run tests and build after fixes**

Run:
- `npm run test`
- `npm run build`

Expected: PASS.

**Step 5: Commit**

```bash
git add server/automation/collectors src server README.md
git commit -m "fix: stabilize live xpath automation smoke flow"
```

## Notes for the Implementer

- Always start from the XPath values in `PlantFit_PRD_v1.3.md` section `2.2`
- Show the actual XPath attempted in the UI, not a friendly label only
- Take screenshots before failing a step whenever possible
- Prefer partial success over all-or-nothing failure so the UI stays useful
- Keep the UI plain and readable; do not spend time polishing before the collectors work
- If a live selector differs from the PRD, do not silently replace it; record the mismatch clearly in logs and code comments
