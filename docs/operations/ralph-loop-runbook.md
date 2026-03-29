# Ralph Loop Runbook

This document defines the minimum operating contract for running `ralph-loop` in this repository without unnecessary pauses.

## Objective

- Keep the autonomous run moving unless it reaches a real terminal state.
- Reduce avoidable stops caused by chat-style reporting, external directory access, missing inputs, or unclear recovery rules.

## Non-Stop Principles

1. Use repo-local source-of-truth documents.
2. Log progress to files, not to the user chat.
3. Persist current state so the run can resume after interruption.
4. Treat `DONE`, `NEED_SECRET`, and `HARD_BLOCKED` as the only valid stop states.
5. If not terminal, continue or auto-resume.

## Required Repository-Local Inputs

Before a long run begins, place the current source-of-truth documents under `.ralph/inputs/`.

Recommended inputs:

- `.ralph/inputs/prd.json`
- `.ralph/inputs/PRD.md`
- `.ralph/inputs/Wireframes.md` or equivalent wireframe artifact
- `.ralph/inputs/Design System.md`
- `.ralph/inputs/Screen Flow.md`
- `.ralph/inputs/Testing Strategy.md`

See `.ralph/inputs/README.md` for the repository-local input staging rule.

The live run should prefer these repo-local copies over documents stored in other repositories.

## Required Runtime Files

The autonomous run should maintain these files inside `.ralph/`:

- `state.json`: current story, subtask, status, retry count, last heartbeat
- `progress.md`: append-only progress log
- `failures.md`: exact failure reasons and retry evidence

Executable runtime helpers such as `scripts/ralph-run.sh`, `scripts/ralph-watchdog.sh`, and any `launchd` plist should be reviewed separately before being committed.

## Recommended State Contract

Minimum fields for `.ralph/state.json`:

- `status`
- `currentStory`
- `currentSubtask`
- `lastCompletedStory`
- `retryCount`
- `lastHeartbeatAt`
- `terminalReason`

## Preflight Checklist

Run this checklist before starting a long autonomous session:

1. The repository contains all required source-of-truth files locally.
2. The selected agent actually exists on this machine.
3. The project can run non-interactively.
4. Browser dependencies needed for visual review are installed.
5. Secrets required for the planned scope are already available, or a fallback path is defined.
6. The progress and failure logs are writable.
7. The session has a clear resume strategy.

## Known Pause Triggers

These are the most common reasons long coding runs stop unexpectedly:

- progress reporting phrased as a chat handoff
- external directory reads that trigger approval
- unavailable requested agent, followed by fallback confusion
- long-running loop protection such as `doom_loop`
- missing browser or environment dependencies
- commit or push behavior being requested before the repository is ready

## Recommended Mitigations

- Keep source-of-truth docs inside this repository.
- Use file-based progress logs.
- Explicitly define terminal states.
- Test the chosen agent with a short smoke run before the real run.
- Keep a human-readable recovery procedure in the repository.

## Smoke Run Recommendation

Before the real session, run a short harmless task to verify:

- the agent starts
- the logging path works
- no external directory approval is triggered
- the session can update `.ralph/state.json`

## Completion Standard

A run should only finish when one of the following is true:

- `DONE`: all planned work and evaluations passed
- `NEED_SECRET`: a real secret or credential is missing
- `HARD_BLOCKED`: a documented blocker prevents safe continuation

Any other stop should be treated as an interruption and resumed.
