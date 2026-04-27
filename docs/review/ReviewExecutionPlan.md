# Review Execution Plan

## Objective
Run an end-to-end review of all app use cases to detect functional discrepancies, UX gaps, and improvement opportunities, with reproducible evidence and prioritized remediation.

## Review Tracks
1. Functional behavior by user flow.
2. Data integrity and plan scoping rules.
3. UX consistency and feedback states.
4. Offline/PWA behavior.
5. Accessibility and error handling.

## Severity Scale
- Critical: data loss, broken primary flow, incorrect business rule.
- High: major friction or misleading metrics.
- Medium: inconsistent UX or non-blocking logic gaps.
- Low: polish and copy clarity.

## Execution Phases
1. Baseline setup.
- Fresh browser profile.
- Existing-user profile with historical data.
- Mobile viewport and desktop viewport.

2. Scenario execution.
- Execute [UseCaseMatrix.md](UseCaseMatrix.md) case by case.
- Capture expected vs observed result.
- Attach evidence: screenshot, console output, reproduction notes.

3. Defect triage.
- Assign severity and affected flows.
- Link each finding to one or more use-case IDs.
- Propose corrective action and effort (S/M/L).

4. Regression pass.
- Re-run impacted cases after each fix batch.
- Mark findings as Resolved/Partially Resolved/Rejected.

## Business Invariants To Validate
1. Exactly one active plan at a time.
2. All user data entities are plan-scoped.
3. Deleting a plan removes only that plan data.
4. Dashboard metrics reflect active plan only.
5. Writing sessions consistently map to writing activity blocks per intended rule.

## Deliverables
1. Completed use-case matrix with pass/fail and evidence.
2. Findings log with severity and remediation proposal.
3. Prioritized implementation backlog for fixes.
