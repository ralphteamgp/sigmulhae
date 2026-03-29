# Ralph Watchdog Setup

This repository keeps the operational guidance in git, while the executable runtime files are reviewed separately before commit.

## Intended Local Runtime Files

These files are expected to exist locally when the no-pause runtime is installed, but they are intentionally not committed by default:

- `.ralph/autonomous-resume-prompt.md`
- `.ralph/smoke-test-prompt.md`
- `.ralph/state.json`
- `.ralph/progress.md`
- `.ralph/failures.md`
- `scripts/ralph-run.sh`
- `scripts/ralph-watchdog.sh`
- `ops/launchd/*.plist`

## Why They Stay Local Until Review

- runtime prompts and scripts need separate inspection
- state and progress files are environment-specific
- launchd plists often contain machine-specific paths

## Local Validation Plan

Before enabling a real long-running session:

1. verify the chosen agent exists on the machine
2. run a harmless smoke prompt that only appends to `.ralph/progress.md`
3. confirm `.ralph/state.json` records session and heartbeat data
4. confirm the watchdog can restart a stopped runner
5. only then enable launchd or cron automation
