# Execution Strategy and Native Dispatch

Read this after the engine is resolved and before implementation begins. The kernel owns route resolution and WIP/write gates; the selected engine owner carries any engine-specific lock. This file owns native scheduling, worker packets, lifecycle, and integration.

## Single-lead invariant

One lead context executing inline is the default. Units execute serially in dependency order. The lead is the only integration owner, runs authoritative verification, and creates canonical commits.

A native implementation worker is allowed only when the user explicitly requests delegated implementation in the current run and one bounded unit is large enough to repay its context ramp-up. At most one implementation worker may be active. Do not launch a second worker until the first result is integrated and the worker is retired. Parallel implementation, worker pools, agent teams, and autonomous fan-out are prohibited.

Independent read-only tool calls may be batched because they do not create implementation contexts or competing writes.

| Strategy | When to use |
|----------|-------------|
| **Inline** | Default for every plan; the lead implements units serially |
| **Serial worker** | Current-run user authorization plus one bounded, worthwhile unit |
| **Parallel workers** | Never for implementation |

## Before an authorized worker

Confirm all of these before dispatch:

1. Every dependency for the unit is committed.
2. The unit has a bounded file and behavior scope.
3. No other implementation worker or external implementation engine is active for this run.
4. The harness provides an isolated workspace. If it exposes only a shared workspace, execute inline instead.
5. The expected value of a fresh context exceeds its context-loading and integration cost. Otherwise execute inline.

Once a unit is selected for cross-model execution, use the loaded controller protocol for that unit; it must not re-enter ordinary native dispatch. A cross-model worker still consumes the run's single implementation-worker slot.

Classify a rejected native dispatch by whether a worker launched: correct a pre-launch argument rejection once, leave capacity-limited work queued, and if another launch failure survives correction, execute that unit inline under the same packet and verification contract.

## Native dispatch (inline/subagent engines only)

## Worker packet and lifecycle

Create a fresh worker context for exactly one unit. It may continue or recover that unit, but never receive a different unit. Give it:

- The plan path plus a **bounded unit packet**: Goal Capsule, Definition of Done, unit Goal/Files/Approach/Execution note/Test scenarios/Verification, relevant Verification Contract entries, cited R/F/AE/KTD excerpts, and every governing Product Contract Key Decision whose `Governs R…` links name the unit's cited R-IDs. Do not send "read the whole plan".
- The inherited authority and explicit instruction that it may narrow but never broaden scope.
- The applicable evidence strategy. For behavior-bearing changes, require proof-first or characterization-first evidence before production edits.
- Instructions to report actual changed paths and verification evidence: `behavior_changed`, tests inspected and changed, red failure or characterization baseline when applicable, verification command/result, and any deliberate no-test exception.
- An instruction not to stage, commit, publish, or start another worker. The lead owns those actions.

Omit permission-mode overrides so the user's configured permissions remain in force.

## Integrate before continuing

After each inline or worker unit, the lead:

1. Inspects the actual diff, not only the worker summary, against the unit scope and owned files.
2. Checks semantic contracts, generated/config surfaces, runtime resources, and out-of-scope edits.
3. Runs the relevant authoritative tests and records the unit's verification evidence. Never fabricate a red-before observation omitted by a worker.
4. Fixes failures before beginning another unit, updates task state, and creates the path-limited canonical commit.
5. Retires the worker after proving its result is integrated. Invoke explicit close/release or workspace cleanup only when the harness assigns that lifecycle action to the lead.

Only then may the next unit begin. Harness-owned worktrees or uploaded change sets change transport mechanics, not the one-worker invariant or the lead's integration responsibility.
