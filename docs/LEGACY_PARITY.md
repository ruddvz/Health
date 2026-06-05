# Legacy → SvelteKit parity matrix

| Legacy feature                        | SvelteKit status | Notes                                        |
| ------------------------------------- | ---------------- | -------------------------------------------- |
| Intake 6-step form                    | **Ported**       | `src/routes/+page.svelte` + welcome launcher |
| Skip to JSON                          | **Ported**       | Welcome + import route                       |
| Paste / upload JSON                   | **Ported**       | `/import` with preview                       |
| Today timeline + macros               | **Ported**       | `/today`                                     |
| Meals cook mode                       | **Ported**       | `CookModeSheet`                              |
| Meal swaps                            | **Ported**       | When plan includes `swaps`                   |
| Macro repair hints                    | **Ported**       | Quick fix sheet on Meals                     |
| Training weekly split                 | **Ported**       | `/train` + session route                     |
| Rest timer                            | **Ported**       | Session page                                 |
| Progress weight/waist                 | **Ported**       | `/progress` check-in                         |
| Phases / Prep / Grocery / Supplements | **Ported**       | `/system/*`                                  |
| Light mode toggle                     | **Ported**       | Settings appearance                          |
| Health Lock / passkey                 | **New**          | Not in legacy HTML                           |
| Cloud backup                          | **New**          | Optional backend                             |
| Single-file offline CSP app           | **Retired**      | `legacy/index.html` archived                 |

## Intentionally not ported

- Nothing in legacy that required server-side rendering
- Analytics (never present in legacy)

## Reference

Use `legacy/index.html` only for behavior archaeology; do not ship it on GitHub Pages.
