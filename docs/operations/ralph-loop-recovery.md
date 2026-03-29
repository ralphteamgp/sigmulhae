# Ralph Loop Recovery Guide

Use this guide when an autonomous run pauses, exits, or appears stuck.

## Goal

Recover the run quickly without losing context or forcing the agent to restart from scratch.

## First Checks

1. Open `.ralph/state.json`.
2. Read the latest lines of `.ralph/progress.md`.
3. Read the latest lines of `.ralph/failures.md`.
4. Determine whether the run stopped in a valid terminal state.

## Valid Terminal States

- `DONE`
- `NEED_SECRET`
- `HARD_BLOCKED`

If the state is not one of these, the run should usually be resumed.

## Common Failure Modes

### 1. The agent paused after writing a summary

Cause:
- The prompt or instructions encouraged conversational reporting.

Action:
- Resume using the last unresolved story or subtask from `.ralph/state.json`.
- Move any future reporting into `.ralph/progress.md`.

### 2. The run stopped because it tried to read another repository

Cause:
- External directory access triggered approval.

Action:
- Copy the needed document into `.ralph/inputs/`.
- Resume using the repo-local copy.
- Keep the recovery note in `.ralph/failures.md` so the next run does not repeat the same external read.

### 3. The requested agent was unavailable

Cause:
- The configured agent name does not exist on the current machine.

Action:
- Check the installed agents.
- Select the effective agent explicitly.
- Record the chosen fallback in `.ralph/failures.md` and resume.

### 4. The run appears idle for too long

Cause:
- The process may have died, hung, or hit a loop-protection stop.

Action:
- Compare the current time to `lastHeartbeatAt` in `.ralph/state.json`.
- If stale, restart from the recorded unresolved subtask.
- Preserve the existing logs instead of replacing them.

### 5. A secret is actually missing

Cause:
- The current step cannot continue safely without a credential.

Action:
- Set the state to `NEED_SECRET`.
- Record the exact missing value and where it is needed in `.ralph/failures.md`.

### 6. The run cannot proceed safely after multiple retries

Cause:
- A real blocker remains after reasonable alternative attempts.

Action:
- Set the state to `HARD_BLOCKED`.
- Record the blocker, evidence, and recommended next step in `.ralph/failures.md`.

## Resume Rule

Resume from the first unresolved story or subtask recorded in `.ralph/state.json`.
Do not restart the whole project unless the repository state is clearly corrupted.

## Logging Rule

Every recovery action should append one short note to `.ralph/progress.md` or `.ralph/failures.md` so the next recovery attempt has better evidence.

## Review Boundary

If the recovery requires changing runtime prompts, watchdog scripts, or machine-specific launchd files, review those operational files separately before committing them.
