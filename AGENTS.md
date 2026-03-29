# AGENTS.md

This repository is the autonomous execution workspace for the PlantFit Ralphthon build.

## Purpose

- Build and refine the PlantFit web product without unnecessary pauses.
- Preserve the Ralphthon wow-factor while staying faithful to the source-of-truth docs.
- Prefer repo-local inputs and logs so the run does not stop on external directory approvals.

## Read First

When present, read these before making changes:

1. `.ralph/state.json`
2. `.ralph/inputs/`
3. `docs/operations/ralph-loop-runbook.md`
4. `docs/operations/ralph-loop-recovery.md`
5. `README.md`

## Autonomous Run Contract

- Do not pause for progress updates.
- Do not ask for confirmation after summaries or story completion.
- Write progress to `.ralph/progress.md`.
- Write blockers and retry evidence to `.ralph/failures.md`.
- Keep `.ralph/state.json` current.
- The only valid terminal states are `DONE`, `NEED_SECRET`, and `HARD_BLOCKED`.
- If not in a terminal state, continue.

## Execution Rules

- Prefer repo-local docs over external references.
- Avoid reading outside this repository unless a human explicitly requires it.
- Complete work one story at a time in dependency order.
- Do not mark work complete until tests and required visual checks pass.
- Preserve wireframe fidelity, readability, layout stability, and demo-worthy hero moments.

## Notes

- If `scripts/` or `.ralph/` helpers exist, use them instead of inventing a new run flow.
- Keep operational guidance in `docs/operations/` and keep this file concise.
