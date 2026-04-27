# Initial Findings (Static Review)

Date: 2026-04-26
Scope: static inspection of routes, store/services, PWA config, and design alignment.

## Findings

1. High - PWA manifest icon paths appear incorrect for static serving.

- Evidence: [public/manifest.json](../../public/manifest.json)
- Current value uses `public/manifest-icon-*.png` instead of root static path.
- Risk: install icons may fail to resolve in some contexts.
- Suggested fix: use `/manifest-icon-192.maskable.png` and `/manifest-icon-512.maskable.png`.

2. Medium - Sidebar logo path uses `\/public\/...` pattern that may fail in production/static contexts.

- Evidence: [src/components/Sidebar.tsx](../../src/components/Sidebar.tsx)
- Risk: branding icon may not load and fallback is always used.
- Suggested fix: switch to `/manifest-icon-192.maskable.png`.

3. High - Writing autosave does not create linked writing activity block.

- Evidence: [src/routes/writing.tsx](../../src/routes/writing.tsx)
- `doAutoSave` stores `writing_entries` only; writing block is created only in `handleSave` for first save path.
- Risk: discrepancy vs expected behavior where writing activity should consistently count in daily activity metrics.
- Suggested fix: define explicit rule and implement it consistently:
  - Option A: autosave never affects activity metrics (draft only), and UI states this.
  - Option B: autosave creates/updates linked writing block incrementally.

4. Medium - Design doc includes manual JSON backup/export strategy but no visible implementation yet.

- Evidence: [docs/DesignDoc.md](../DesignDoc.md)
- Risk: no user-level recovery path for local-only data.
- Suggested fix: add export/import feature in settings/profile area.

5. Medium - Monthly review module exists in schema but has no user-facing flow in current routes.

- Evidence: [src/db/index.ts](../../src/db/index.ts)
- Risk: roadmap expectation mismatch and unused data model complexity.
- Suggested fix: either implement route/UI or de-scope from current MVP schema/docs.

## Strengths Verified

1. Plan-scoped data model and hooks are consistently applied.

- Evidence: [src/db/index.ts](../../src/db/index.ts), [src/db/hooks.ts](../../src/db/hooks.ts)

2. Active plan state is centralized and update operations are available.

- Evidence: [src/store/profile.ts](../../src/store/profile.ts), [src/services/plans.ts](../../src/services/plans.ts)

3. Plan Builder route is integrated in route tree and navigation.

- Evidence: [src/routeTree.gen.ts](../../src/routeTree.gen.ts), [src/routes/plan.tsx](../../src/routes/plan.tsx), [src/components/TopHeader.tsx](../../src/components/TopHeader.tsx)

## Proposed Next Execution Step

Run the matrix cases UC-001 to UC-021 first (core loop: bootstrap, dashboard, log, writing), then triage fixes before resources/PWA rounds.
