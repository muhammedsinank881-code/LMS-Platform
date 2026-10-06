# Phase 1 audit (Step 12, Part A)

Audit of the app built in Steps 1–11. No product code was changed. Severity is **blocker** (a primary flow is unusable or fails a hard check), **major** (clearly broken or below the Step 12 bar on a real viewport or assistive path), or **minor** (inconsistent, incomplete, or safe to defer).

Findings are written so you can approve a subset. Recommended disposition is in the last section.

## Already in good shape

These do not need a rewrite. Later parts should extend them.

- Routes are lazy-loaded through `lazyPage`. `AppShell` is the eager shell.
- Skip link, `header`, sidebar `nav`, mobile `nav`, and `main#main-content` exist. Most pages have one `h1`. Settings sections use `h2`.
- Dialogs and drawers are Radix dialogs (focus trap, Escape, focus return, `aria-modal`). `FormField` wires `htmlFor`, `aria-invalid`, and `aria-describedby` when a screen uses it.
- Charts go through `ChartCard`, which renders a visually hidden data table (`ChartSummary`).
- Leads use `DataTable` card mode with a real card. Kanban columns virtualize after 50 cards and, on phones, replace drag with a “Move to stage” menu.
- The shell uses `h-dvh`. The bottom tab bar uses `env(safe-area-inset-bottom)` and is `lg:hidden`.
- Status, score, and priority badges include a text label, not only a color.
- Toasts use Radix Toast (an `aria-live` region). `/dev/data-check` is already gated with `import.meta.env.DEV`.
- No `any`, no `console.*`, and no `TODO` / `FIXME` in `src`. ESLint already errors on `no-explicit-any`.
- Components do not import mock data. They use TanStack Query hooks. Types from `services/api` are fine.

## 1. Responsive

| ID | Sev | Finding |
| --- | --- | --- |
| R1 | blocker | **Deals list is blank below 1024px.** `DataTable` switches to cards at `max-width: 1023px`, and `DealsPage` passes `renderCard={() => null}`. Phone and tablet show empty cards. |
| R2 | blocker | **Lead detail stacks two bottom bars.** `MobileTabBar` is mounted for every shell route, including `/leads/:id` and settings forms. `LeadMobileBar` is `fixed … bottom-16` (`64px`) and does not use the safe-area inset. The tab bar is `min-h-14` plus `env(safe-area-inset-bottom)`, so on a phone with a home indicator the call / WhatsApp / status bar overlaps the tabs. |
| R3 | major | **Page header actions do not wrap.** `PageHeader` puts actions in a non-wrapping `shrink-0` row. Leads (Import, Export, Add Lead), Deals, and Audit overflow the viewport at 360px. |
| R4 | major | **Modals stay centered cards.** `ModalContent` is `max-w-*` with page padding. Compare leads (`grid-cols-[8rem_1fr_1fr]`), assign, confirm, and convert dialogs do not become full-screen drawers. The compare grid clips or crushes at 360px. Side drawers are already full width on small screens. `FollowUpComposer` already swaps to a drawer under 768px; other modals do not. |
| R5 | major | **Filters open in a popover, not a bottom sheet.** Leads toolbar and Pipeline both use `Popover` + `FilterBuilder`. On a phone the panel is `min(100vw - 2rem, 40rem)` and can sit under the keyboard. |
| R6 | major | **Kanban snaps, but has no stage tab strip.** Columns are `w-72` inside `snap-x`. There is no strip of stage names to jump to a column. Column bodies use `max-h-[70vh]`, so the mobile browser toolbar clips the last cards. |
| R7 | major | **Several tables only scroll sideways.** Sales performance (`PerformanceReportTab`, 11 columns), the roles matrix, and report breakdown tables use `overflow-x-auto` and do not collapse to cards. Contained scroll is acceptable on desktop; at 360px these are the page. |
| R8 | major | **Touch targets under 44px on mobile.** `Button` `sm` is `h-8` (32px) and `icon-sm` is 32×32, with no `max-sm` bump. `md` and `icon` do grow to 44px. Pipeline search forces `h-8`. Sortable grip handles are `p-1` around a 16px icon. Calendar day chips and “more” buttons are `h-6`. Audit filter chips, follow-up icon buttons, toast dismiss, and column “Load more” use the small sizes. |
| R9 | major | **Inputs are 14px, so iOS zooms on focus.** `fieldVariants` `sm` and `md` use `text-sm`. Nothing sets a 16px floor under `max-sm`. No `inputMode` anywhere. Phone fields use `type="tel"` but not `autoComplete="tel"`. Budget and deal value use `type="number"` only. Profile phone is a plain text input. |
| R10 | major | **Sticky UI ignores the safe area except the tab bar.** Settings save bar is `sticky bottom-0` inside a main that is covered by the tab bar. The toast viewport is `fixed bottom-0 right-0`, so toasts sit under the tabs. Bulk actions use `bottom-20`, which does not include `env(safe-area-inset-bottom)`. |
| R11 | major | **Follow-up week calendar is a wide grid.** `WeekView` is `overflow-x-auto`. Month chips are 12px text and shorter than 44px. There is no phone agenda as the default (an agenda component exists and is not the small-screen layout). |
| R12 | minor | **Audit and team cards are one line.** Below 1024px, audit cards render only `summarizeAuditChange`, and member cards render only the name. Usable, but missing time, user, role, and status. |
| R13 | minor | **Settings section nav is a horizontal scroller** (`w-max` inside `overflow-x-auto`). It does not overflow the page, but every section is a small text hit target and there is no section picker. |
| R14 | minor | **Bottom drawers use `max-h-[85vh]`**, not `dvh`, so the mobile toolbar can cover the footer. The app shell itself already uses `h-dvh`. |

## 2. Accessibility

| ID | Sev | Finding |
| --- | --- | --- |
| A1 | major | **`prefers-reduced-motion` is not handled.** Spinners, sidebar width, toasts, and drag transforms always animate. |
| A2 | major | **Required fields are indicated only by a colored asterisk that assistive tech cannot see.** `Label` renders `*` with `aria-hidden`. `FormField` does not set `required` or `aria-required` on the control. |
| A3 | major | **Sortable tables do not expose sort state.** `TableView` headers are `<th>` without `scope` or `aria-sort`. The sort control is an unlabeled button; the arrow is `aria-hidden`. The sales performance table is a raw `<table>` with the same gap. |
| A4 | major | **Drag and drop has no live announcements, and the calendar has no keyboard path.** Kanban and `SortableList` register `KeyboardSensor`, but nothing announces pick up, move, or drop. On phones the board disables sensors entirely (the stage menu is the alternative, and it is not documented in the UI). The follow-up calendar registers only `PointerSensor`. |
| A5 | major | **Primary button text is under WCAG AA.** `--primary` is `hsl(239 84% 67%)` with white `--primary-foreground`. That pair is about **4.4:1**. Button labels are 14px, so they need 4.5:1. Soft badges keep `text-foreground` and are fine. Solid `info`, `cold`, and `hot` badges (white on those hues) fail; they are used on the design-system page, not in product screens. |
| A6 | major | **`eslint-plugin-jsx-a11y` is not installed.** ESLint is type and hooks rules only. There are no `vitest-axe` / `jest-axe` tests. |
| A7 | major | **Many settings and team fields have an accessible name and no visible label** (`aria-label` on “New status”, “New tag”, probability, and so on). Programmatic names exist; sighted users get a placeholder or nothing. |
| A8 | minor | **Muted text is on the AA edge.** `--muted-foreground` (`220 9% 46%`) on `--background` is about 4.6:1. The same color on `--muted` or at `text-xs` (12px) drops below 4.5:1 in metadata, chart ticks (`fontSize: 11`), and helper lines. |
| A9 | minor | **Color picker options are named by hex** (`aria-label={color}`), so the name does not say what the color is for. The selected swatch is not supplemented with text. |
| A10 | minor | **Avatar images use `alt=""`** because the root has `aria-label={name}`. They have CSS size, not `width` / `height` or `loading="lazy"`. |
| A11 | minor | **Global `:focus-visible` and component rings both paint.** The base rule in `globals.css` plus `focusRing` / `fieldFocus` can show a double ring. Focus is visible; the treatment is inconsistent. |

Dialogs, the skip link, landmarks, chart text alternatives, and toast announcements are in place (see the opening section). Do not rebuild them.

## 3. State coverage

Every data view needs a skeleton (or equivalent), an empty state (icon, title, description, action when one exists), and an error state (plain-language message, Retry, no raw error text).

| ID | Sev | Screen | Loading | Empty | Error |
| --- | --- | --- | --- | --- | --- |
| S1 | major | Settings lists (workspace, profile, statuses, pipelines, sources, tags, custom fields, qualification, assignment, lost reasons, billing) and Teams | One line of text, or nothing (profile renders an empty form while `useMember` loads) | A blank list, no `EmptyState` | A bare `Retry` button, no message |
| S2 | major | Deals list, Audit list | `DataTable` skeleton | A `<p>` (“No deals match…”, “No audit entries match.”), no icon or action | `DataTable` error state is fine |
| S3 | major | Tasks, follow-ups, pipeline “no pipelines” | Skeleton | `EmptyState` title only; tasks empty has no icon; pipeline empty has no description or action | Message + Retry, good |
| S4 | major | Audit detail drawer, profile member, notification preferences on the profile page | “Loading…” or silent | n/a | No error UI. A failed member fetch looks like an empty profile |
| S5 | major | Route crashes | n/a | n/a | `RouteErrorBoundary` puts `error.message` or `statusText` in the description. That is a raw technical string |
| S6 | major | Offline | n/a | n/a | No offline banner. Query has no online manager wiring. A failed request looks like a generic load error |
| S7 | minor | Dashboard team filter, report filter selects | The charts and KPI grid have loading, empty, and error | Covered by `ChartCard` | The team/source selects fail quietly and show “All …” |
| S8 | minor | Customers, Inbox, Campaigns, Automations | Placeholder pages, not data views | `ModulePlaceholder` | n/a |

Leads list, lead detail, deal detail, notifications, and dashboard charts already follow the pattern closely.

## 4. Performance

| ID | Sev | Finding |
| --- | --- | --- |
| P1 | major | **Recharts and `@dnd-kit` are static imports of their route modules.** Dashboard, reports, pipeline, follow-up calendar, and settings sortable lists pull them in as soon as the route loads. They are not in the eager shell today (the shell does not import them). They are not loaded on first use inside the page. |
| P2 | major | **No `React.memo` on hot rows.** Kanban cards, `DataTable` rows, and calendar cells re-render with new inline handlers (`ownerName`, `sourceIcon`, `onOpen`, `onMove` in `PipelineBoard` / `ColumnHost`). |
| P3 | major | **No prefetch.** Lead detail is not prefetched on row hover or focus. List pages do not prefetch the next page. |
| P4 | major | **No bundle analyzer script and no measured baseline.** `vite-plugin-pwa` and `xlsx` are dependencies. `xlsx` is never imported, so it is not in the bundle today. There is no `analyze` script and no before/after size in this file yet. |
| P5 | minor | **Virtualization is only the Kanban column, and only after 50 cards.** Notifications are paginated (20). There is no import-review table (see C6). A column under 50 cards renders every card. |
| P6 | minor | **Avatars can shift.** `Avatar` sizes itself with Tailwind classes. The image has no explicit width/height attributes and no lazy loading. |

Route-level splitting for pages is already done.

## 5. Consistency

| ID | Sev | Finding |
| --- | --- | --- |
| C1 | major | **Currency symbols are hardcoded in forms.** `LeadFormDetails`, `LeadCustomFields`, and `FilterValueInput` pass `leftAdornment="₹"` or the same for currency fields. Billing cards use `₹0` and `₹4,999 / month`. Display paths correctly use `CurrencyText` / `formatINR`. The workspace currency setting is not what the form adornment shows. |
| C2 | major | **New records are created with a fixed hex.** Tags, teams, pipeline stages, and statuses submit `color: '#6366f1'` instead of `lib/settings/palette.ts` or `ColorPicker`. |
| C3 | major | **Empty and error UI is not one pattern.** Shared `EmptyState` and `Skeleton` exist. Settings and teams use a sentence plus a `Retry` button. Deals and audit use a paragraph. `RouteErrorBoundary` shows the exception text. |
| C4 | minor | **Confirm and toast wording drifts.** `ConfirmDialog` defaults to “Confirm”. Call sites use “Delete”, “Move”, “Leave”, “Reopen”, “Mark invalid”. Destructive deletes on teams are a bare “Delete” button with no dialog. Toasts mix “Tag added”, “Reason added”, “Pipeline created”, “Permissions saved”. |
| C5 | minor | **Search is two widgets.** Leads and notifications use `SearchInput`. Team, audit, and pipeline use a raw `Input` or `SearchInput` with a height override. |
| C6 | minor | **Import is a dead control, and `xlsx` is unused.** The Leads header renders an Import button with no `onClick`. There is no wizard. `import-targets.ts` is config only. `papaparse` and `xlsx` are installed and never imported. Building the wizard is a new feature and is out of scope for this step. |

No second copy of Button, Modal, DataTable, or EmptyState showed up. Do not merge components that are not actually duplicated.

## 6. Code quality

| ID | Sev | Finding |
| --- | --- | --- |
| Q1 | major | **Files over ~250 lines.** `services/mock/resources/leads/index.ts` (329), `services/mock/seed/leads.ts` (306), `features/leads/pages/LeadsPage.tsx` (296), `services/mock/resources/settings.ts` (292), `features/leads/hooks/use-lead-mutations.ts` (266), `services/mock/resources/deals.ts` (265), `services/mock/resources/followups.ts` (254), `features/pipeline/components/PipelineBoard.tsx` (252). `LeadDetailView.tsx` (247) and `FollowUpsPage.tsx` (244) are just under. |
| Q2 | major | **`TeamPage` omits required `MembersTable` props** `teamId` and `status`. That is a TypeScript error (`tsc` is not part of `vite` dev). At runtime the extra filters are simply absent. |
| Q3 | major | **Pure `lib` modules without a unit test:** `date-range.ts`, `date-input.ts`, `notification-prefs.ts`, `lead-fields.ts`, `followup-groups.ts`, `task-groups.ts`, `overdue-label.ts`, `source-icon.ts`, `filters/date-presets.ts`, `settings/reorder.ts`, `settings/custom-field.ts`, `settings/audit-summary.ts`, `settings/business-hours.ts`, `settings/terminal.ts`. Scoring, duplicates, currency, permissions, phone, calendar grid, and merge already have tests. |
| Q4 | minor | **No dev role switcher.** Step 3 called for one. Login shows demo accounts only when `import.meta.env.DEV`. Nothing in the shell switches role without signing in again. Adding a switcher is a small feature; this step should not invent one unless you ask. |
| Q5 | minor | **`AuditLogsPage` quick filters use `variant="default"`**, which is not a `Button` variant. `cva` falls through to `primary`, so the selected chip works by accident. |

`any`, `console`, and leftover TODOs were not found.

## Tooling and PWA (not built yet)

These are gaps against Part F and Part G, not regressions in Steps 1–11. Severity is **major** because this step’s exit criteria depend on them, and **minor** where the current code is already safe.

| ID | Sev | Finding |
| --- | --- | --- |
| T1 | major | **PWA is a dependency only.** `vite-plugin-pwa` is not registered in `vite.config.ts`. No manifest, service worker, icons, or update prompt. `index.html` has a basic viewport and SVG favicon. Missing: `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`. |
| T2 | major | **No install prompt, offline shell, or “you’re offline” data state.** |
| T3 | major | **No Lighthouse scores and no bundle size** recorded yet. Accessibility target is 95+. Initial JS target is about 250 KB gzipped. |
| T4 | major | **CI and a11y scripts are missing.** `package.json` has `lint`, `typecheck`, `test`, `build`, `preview`. Missing: `test:a11y`, `analyze`, and `.github/workflows/ci.yml`. |
| T5 | minor | **Docs are still the short README.** No `docs/ARCHITECTURE.md` or `docs/KNOWN_ISSUES.md`. |
| T6 | minor | **`/dev/data-check` is already dev-only.** No production leak found. |

## Recommended fix set

Approve by ID. The default below is every blocker and major, with minors only where they are the same edit as a major.

**Part B — responsive:** R1–R11. R12–R14 only if you want the card and settings-nav polish in the same pass.

**Part C — accessibility:** A1–A7. A5 is a token change (`--primary` darker, or white text only on a darker solid). A8–A11 can wait. Do not restyle charts; they already have a hidden table.

**Part D — states and consistency:** S1–S6, C1–C3. C4 (wording) is small and worth doing with the confirm dialogs you already touch. Leave C5 and C6: hide or disable the Import button and record the missing wizard in `KNOWN_ISSUES.md` rather than building it.

**Part E — performance:** P1–P4. P5 and P6 with the avatar and column work if the diff stays small. Do not virtualize paginated lists that stay at 20 rows.

**Part F — PWA:** T1–T3.

**Part G — release:** Q1 for the UI files (`LeadsPage`, `use-lead-mutations`, `PipelineBoard`) if a split is mechanical. Leave mock seed files alone unless a split is obvious. Q2 in the team pass. Q3 for the pure helpers you touch, not a new test for every file. T4–T5. Q4 stays deferred unless you want the switcher.

**Explicitly out of this step:** the import wizard, a new role switcher, Inbox, Campaigns, Automations, Customers beyond the placeholder, and any visual redesign.

## Shipped (Parts B–G)

Approved blockers and majors are in the app. Q2 is already fixed: `TeamPage` passes `teamId` and `status` into `MembersTable`.

- **Contrast.** `--primary` and `--ring` are `243 75% 42%` (`#231bbb`). White text on the Add Lead button measured about 10.9:1.
- **Checks.** `tsc -p tsconfig.app.json --noEmit` passes. `npm run lint` exits 0 with 11 pre-existing `react-hooks/incompatible-library` warnings (`form.watch` and `useVirtualizer`). `npm run test` passed 46 files / 358 tests. Page axe tests cover Login, Dashboard, Leads, lead detail, Follow-ups, Pipeline, and Profile. `color-contrast` is off in jsdom; see `docs/KNOWN_ISSUES.md`.
- **Bundle (production `npm run build`).** The entry graph preloaded by `dist/index.html` is about **463 KB gzipped JavaScript**. The ~250 KB target is missed. The largest preloaded chunk is `state-*.js` at **213.49 KB gzip** (593.55 KB minified): Zod plus Faker, pulled in because the in-memory mock seeds data at startup. Recharts sits in a separate chart chunk (about 91 KB gzip) and is not in that preload list. `@dnd-kit` is in the pipeline and sortable-list chunks.
- **Lighthouse.** Not run. No Lighthouse pass was executed against `vite preview` in this session, so accessibility, performance, and PWA scores are not recorded.
