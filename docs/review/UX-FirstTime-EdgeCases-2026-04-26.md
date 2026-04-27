# UX Analysis: First-Time User + Edge Cases

Date: 2026-04-26
Scope: current implementation behavior (not ideal target behavior).

## 1. First-Time User Journey (As Implemented)

1. User opens app for the first time.

- Root mounts and triggers store init in [src/routes/\_\_root.tsx](../../src/routes/__root.tsx).
- Profile defaults are loaded from localStorage (`username: You`, `goalMinutesPerDay: 60`) in [src/services/profile.ts](../../src/services/profile.ts).
- Default active study plan is ensured/created (`Work English A2-B2`, goal 90) in [src/services/plans.ts](../../src/services/plans.ts).

2. User lands directly on Dashboard.

- Sees greeting and empty-state cards if no data yet in [src/routes/index.tsx](../../src/routes/index.tsx).
- Primary CTAs are present: `Log Activity` and `Writing Mode`.

3. User discovers profile and plans via sidebar/header.

- Profile modal allows editing name/avatar/goal and basic plan management in [src/components/ProfileModal.tsx](../../src/components/ProfileModal.tsx).
- Plan Builder is available via `/plan` in navigation and route tree.

### UX Impression for First-Time Entry

- Positive: app is immediately usable without signup.
- Positive: clear first actions exist from dashboard.
- Gap: no guided onboarding or explanation that plan context is central.
- Gap: first-time mental model (difference between profile goal 60 vs active plan goal 90) can be confusing.

## 2. First-Time UX Frictions (High Signal)

1. Conflicting goals at first launch.

- Profile default goal is 60, active plan default goal is 90.
- Dashboard uses active plan goal, profile initially shows profile goal value context.
- Risk: trust gap, "which goal is real?"

2. No explicit onboarding state.

- User is dropped into full UI with no progressive guidance.
- No “Step 1 / Step 2” flow for first block, first resource, first writing entry.

3. Silent failures in forms when active plan is unavailable.

- Example in log block submit: if no `planId`, function returns without user message in [src/routes/log.tsx](../../src/routes/log.tsx).
- This is rare but important for resilience and user confidence.

4. Save feedback inconsistency.

- Plan Builder shows saved timestamp.
- Other flows rely mostly on implicit refresh; success toast/banner is not consistent.

## 3. Edge Cases by Flow

## 3.1 Bootstrap and State

- Corrupted localStorage profile JSON.
  : Fallback exists to defaults (good), but no user-facing recovery message.
- Plan table exists but no active plan flagged.
  : `ensureDefaultPlan` promotes first plan to active (good).
- Active plan deleted while operations in-flight.
  : Async operations may finish against stale UI context; should be guarded with user feedback.

## 3.2 Dashboard

- Goal equals 0 or invalid.
  : UI clamps percent in bars, but source should always validate and prevent invalid persistence.
- Very large block counts in one day.
  : Dashboard truncates list to first 5 and shows “+N more” (good), but no sorting toggle.

## 3.3 Activity Log

- Submit with invalid minutes.
  : Prevented by input and check; no explicit inline validation message.
- Edit/delete race on same block from multiple tabs.
  : Dexie will reconcile writes, but UX has no conflict messaging.
- Date timezone edge at midnight.
  : Date string conversion uses local `Date`; should be regression-tested around timezone boundaries.

## 3.4 Writing Mode

- Autosave creates entry, manual save creates linked block only on first non-saved path.
  : Potential inconsistency with expected “writing always counts as activity”.
- Discard after autosave.
  : Discard deletes saved draft if `savedId` exists; behavior is correct but can surprise users without draft concept explanation.
- Timer reset edge.
  : Timer starts on first keystroke and resets on save/discard (good), but no pause/resume control.

## 3.5 Resources

- Delete category with many resources.
  : Confirmation exists; no undo path.
- Tag parsing edge (extra commas/spaces).
  : Trims and filters (good), but no normalization to lowercase.

## 3.6 Plan Builder

- Invalid template JSON from older/malformed plans.
  : Robust fallback parser exists in [src/routes/plan.tsx](../../src/routes/plan.tsx) (good).
- Empty labels/minutes edge.
  : Minutes are normalized to minimum 1, labels may remain empty.
- Save flow has no dirty-state guard.
  : User can leave page with unsaved changes and no warning.

## 3.7 Navigation + PWA

- Manifest icon path risk.
  : `public/manifest.json` uses `public/...` relative paths; likely should be root-relative.
- Sidebar logo uses `/public/...` source.
  : May fail in some static hosting contexts.

## 4. UX Recommendations (Prioritized)

## Priority 1 (Immediate, High Impact)

1. Unify first-launch goals.

- Set profile default goal equal to default plan goal, or hide profile-level goal if plan-level goal is source of truth.

2. Add first-run onboarding ribbon on dashboard.

- Three checklist items:
  - Log your first activity block.
  - Add your first resource.
  - Save your first writing entry.

3. Add consistent success/error feedback.

- Lightweight toast system for save/delete/switch-plan actions.

4. Resolve writing consistency rule.

- Decide and communicate one rule:
  - Draft autosave does not affect activity metrics, only manual “Save Entry” does.
  - Or autosave updates a linked writing block progressively.

## Priority 2 (Near Term)

1. Unsaved changes guard in Plan Builder.
2. Inline validation copy for numeric and required fields.
3. Empty/blocked state messaging when no active plan context is available.
4. Undo affordance for destructive actions (resource/category/block delete).

## Priority 3 (Polish)

1. Contextual microcopy explaining active plan scope in each module.
2. Optional quick tips (dismissible) for first week usage.
3. Import/export backup entry point in profile/settings.

## 5. Proposed First-Time UX Flow (Target)

1. First launch → welcome card on dashboard.

- “Your default plan A2→B2 is ready.”
- Buttons:
  - Start with quick block.
  - Customize my plan.

2. Guided checklist persists until completed.

- Step 1: add activity (log).
- Step 2: writing entry.
- Step 3: add one resource category/link.

3. Post-step celebrations.

- Small progress feedback (“Great start, day 1 is active”).

4. After first 3 actions.

- Hide onboarding and keep concise tips in profile/help.

## 6. Validation Metrics For UX Success

1. Time to first meaningful action (TTFMA): target < 60 seconds.
2. First-session completion rate of checklist: target > 70%.
3. Error-free submission rate in core forms: target > 95%.
4. Week-1 retention proxy: users with >=3 valid days in first 7 days.
