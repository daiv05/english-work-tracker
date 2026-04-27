# Use Case Matrix

Status values: `Not Run`, `Pass`, `Fail`, `Blocked`.

| ID | Area | Use Case | Expected Result | Status | Notes/Evidence |
|---|---|---|---|---|---|
| UC-001 | Bootstrap | First app launch with empty DB | Default plan is created and set active | Not Run | |
| UC-002 | Bootstrap | App reload after initialization | Active plan and profile state are restored | Not Run | |
| UC-003 | Profile | Update display name | Name updates in profile and UI headers | Not Run | |
| UC-004 | Profile | Upload avatar | Avatar persists and renders in sidebar/header | Not Run | |
| UC-005 | Profile | Remove avatar | Avatar reverts to initial-based fallback | Not Run | |
| UC-006 | Plans | Create new plan | Plan is created and listed in selectors | Not Run | |
| UC-007 | Plans | Switch active plan | All routes show data scoped to selected plan | Not Run | |
| UC-008 | Plans | Delete active plan with >=2 plans | Active plan is deleted, fallback becomes active | Not Run | |
| UC-009 | Dashboard | Empty state on today | CTA and copy are shown with 0 metrics | Not Run | |
| UC-010 | Dashboard | Goal progress calculation | Progress percent matches total minutes/goal | Not Run | |
| UC-011 | Dashboard | Weekly bars | Bars match last 7 days totals for active plan | Not Run | |
| UC-012 | Dashboard | Streak behavior | Streak follows >=30 min/day rule | Not Run | |
| UC-013 | Log | Add activity block | New block appears for selected date and totals update | Not Run | |
| UC-014 | Log | Edit activity block | Block updates persist and timeline refreshes | Not Run | |
| UC-015 | Log | Delete activity block | Block is removed and totals recalculate | Not Run | |
| UC-016 | Log | Date navigation backward/forward | Correct date context and records are loaded | Not Run | |
| UC-017 | Writing | Start typing session | Timer starts on first keystroke | Not Run | |
| UC-018 | Writing | Autosave behavior | Entry persists safely with visible feedback | Not Run | |
| UC-019 | Writing | Manual save behavior | Entry saved and writing block recorded | Not Run | |
| UC-020 | Writing | Discard behavior | Session is discarded without orphan side effects | Not Run | |
| UC-021 | Writing | History by date | Correct entries shown per selected date | Not Run | |
| UC-022 | Resources | Create category | Category appears and can accept resources | Not Run | |
| UC-023 | Resources | Create resource | Resource persists under selected category and plan | Not Run | |
| UC-024 | Resources | Search resources | Matches title/notes/tags consistently | Not Run | |
| UC-025 | Resources | Delete resource | Resource removed without affecting others | Not Run | |
| UC-026 | Resources | Delete category with resources | Category and linked resources are removed | Not Run | |
| UC-027 | Plan Builder | Update plan metadata | Name, levels, goal persist to active plan | Not Run | |
| UC-028 | Plan Builder | Add/edit/remove day blocks | Template JSON updates correctly | Not Run | |
| UC-029 | Plan Builder | Reset template | Template resets to default A2-B2 structure | Not Run | |
| UC-030 | Navigation | Desktop nav active states | Active route highlighting is correct | Not Run | |
| UC-031 | Navigation | Mobile bottom nav behavior | Route switching works and active icon updates | Not Run | |
| UC-032 | Privacy | Privacy page access | Policy route opens and is readable | Not Run | |
| UC-033 | Data integrity | Plan-scoped isolation check | No data leakage across plans | Not Run | |
| UC-034 | Data integrity | Cascading deletes on plan removal | Only deleted plan data is removed | Not Run | |
| UC-035 | PWA | Manifest icons and installability | Icons load and install prompt metadata is valid | Not Run | |
| UC-036 | PWA | Offline reload | App shell loads and core flows operate offline | Not Run | |
| UC-037 | Errors | Invalid numeric inputs | Validation prevents invalid state and informs user | Not Run | |
| UC-038 | UX | Save/loading feedback consistency | All save flows provide clear user feedback | Not Run | |
| UC-039 | First Time UX | First launch with no prior data | User understands next action in <60s | Not Run | |
| UC-040 | First Time UX | Goal consistency at first launch | Profile and plan goal messaging is coherent | Not Run | |
| UC-041 | State Recovery | Corrupted profile localStorage JSON | App recovers safely and communicates fallback | Not Run | |
| UC-042 | Writing Edge | Autosave + manual save consistency | Writing metrics and blocks follow documented rule | Not Run | |
| UC-043 | Writing Edge | Discard after autosave draft | No orphan states or unintended data loss | Not Run | |
| UC-044 | Plan Builder Edge | Navigate away with unsaved changes | User is warned or autosaved predictably | Not Run | |
| UC-045 | Navigation Edge | Active plan changed mid-flow | Current form behavior remains predictable | Not Run | |
| UC-046 | PWA Edge | Manifest icon URL resolution | Icons load in install prompt and app shell | Not Run | |
| UC-047 | Error UX | Submit form without active plan context | User receives clear actionable feedback | Not Run | |
| UC-048 | Destructive UX | Delete category/resource/block | Confirmation + post-action feedback are explicit | Not Run | |
