# Health plan schema v2

Canonical contract for JSON imported into the Health PWA. TypeScript types live in `src/lib/types/planV2.ts`; validation in `src/lib/validation/planV2.ts`.

## Required top-level sections

| Section               | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `meta`                | `plan_schema_version: 2`, labels, dates          |
| `user`                | Name, goals, body metrics                        |
| `phases`              | Calorie/macro targets per phase                  |
| `meal_plan`           | `workout_day` / `rest_day` meal arrays           |
| `training`            | `weekly_split` or `training_note` fallback       |
| `schedule`            | Wake/sleep/meal times (optional but recommended) |
| `safety`              | Allergies, meds flags, cautions                  |
| `supplements`         | Stack + timing (optional)                        |
| `grocery`             | Grouped shopping list (optional)                 |
| `prep` / `prep_guide` | Batch prep steps (optional)                      |
| `progress`            | Targets for logging (optional)                   |

## Minimal example

See `samples/minimal-plan-v2.json` in the repo root.

## Validation severity

- **error** — blocks import (invalid JSON, unsupported schema, unsafe calories, missing required structure)
- **warning** — import allowed; shown on Today and Diagnostics
- **info** — suggestions only

## Safety rules

- No HTML in plan text (rendered as plain text only)
- Extreme calorie deficits flagged
- Supplement + medication interactions generate warnings when `medication_warning` is set in intake
- Plans must not claim to diagnose, cure, or replace medical care

## Versioning

- Supported: `meta.plan_schema_version === 2`
- Older plans may be normalized on import where possible (`normalizePlanV1ToV2` patterns in validation layer)

## Prompt generation

The intake flow builds a Claude prompt requiring **JSON only**, no markdown fences, schema v2, backup meals, grocery, prep, training substitutions, and cautious supplement language. See `src/lib/logic/buildClaudePrompt.ts`.
