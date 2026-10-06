# Project: LeadFlow — Lead Management / Sales CRM SaaS (Frontend Phase)

You are a senior frontend engineer and product designer. Build the complete frontend of a clean, modern, multi-tenant Lead Management CRM, aimed at digital marketing agencies and sales teams. This phase is FRONTEND ONLY, backed by a typed mock data layer that can later be swapped for a real REST API without changing any UI code.

## Product Vision

This is NOT a lead CRUD app. It is a "sales operating system". Any manager must be able to answer at a glance: Where did this lead come from? Who owns it? What happened? What should happen next? When? How valuable is it? Did it generate revenue?

Core journey the UI must support end to end:
Lead Capture → Duplicate Check → Scoring → Qualification → Assignment → Pipeline → Follow-up → Communication → Opportunity/Deal → Won (Customer) / Lost (with reason) → Reporting

## Tech Stack (strict)

- React 18 + Vite + TypeScript (strict, no `any`)
- Tailwind CSS v3 with design tokens in tailwind.config.ts and CSS variables
- React Router v6 (lazy-loaded routes, route guards)
- TanStack Query (all data access) + Zustand (auth, tenant, UI state)
- React Hook Form + Zod
- Radix UI primitives styled with Tailwind, class-variance-authority, clsx + tailwind-merge
- @dnd-kit (Kanban, stage reorder), Recharts (charts), TanStack Table (data tables)
- lucide-react, date-fns, papaparse + xlsx (client-side import parsing), cmdk (command palette)
- @faker-js/faker (seeded) for mock data
- vite-plugin-pwa (PWA-ready manifest and service worker config)

## Design Principles

- Clean, neat, minimal, spacious (think Linear / Attio / Pipedrive). Neutral grays, one indigo brand color, semantic colors reserved for status, priority, and score (Hot = red/orange, Warm = amber, Cold = blue).
- Inter font, 8px grid, 8px radius for inputs/cards, 12px for modals, 1px gray-200 borders instead of heavy shadows.
- Light theme first, tokens in CSS variables so dark mode can be added later.
- Responsive and mobile-first for salesperson flows (see Mobile section). Sidebar becomes a drawer on mobile, and tables become cards.
- Every data view has skeleton loading, empty state, and error state.
- Accessible: keyboard nav, focus rings, aria labels, AA contrast.
- Currency is INR by default, formatted Indian style (₹2,50,000, with compact forms like ₹4.2L / ₹1.2Cr). Currency is configurable per workspace.
- Dates in the user's locale, with relative times ("2 hours ago") and a tooltip with the exact time.

## Folder Structure

```
src/
  app/                    # router, providers, guards, app shell
  components/
    ui/                   # primitives: Button, Input, Select, MultiSelect, Badge, Card, Modal, Drawer, Tabs, Dropdown, Avatar, AvatarGroup, Tooltip, Skeleton, EmptyState, Pagination, Checkbox, Switch, Textarea, DatePicker, DateRangePicker, TimePicker, Toast, Stepper, ProgressBar, ScoreRing
    layout/               # AppShell, Sidebar, Topbar, PageHeader, WorkspaceSwitcher, MobileNav
    common/               # DataTable, FilterBuilder, SavedViews, SearchInput, StatCard, ConfirmDialog, Timeline, RoleGate, CurrencyText, StatusBadge, PriorityBadge, LeadScoreBadge, SourceIcon
  features/
    auth/ onboarding/ dashboard/ leads/ followups/ pipeline/ deals/ customers/ tasks/
    inbox/ (communications) campaigns/ automations/ reports/ team/ settings/
    audit/ notifications/ ai/
    (each: components/, hooks/, pages/, schemas.ts, types.ts, index.ts)
  hooks/ lib/ store/ types/ styles/
  services/
    api/                  # ApiClient interfaces per resource
    mock/                 # seed data, in-memory DB, latency simulation
```

Max about 250 lines per file. Path alias `@/`. ESLint + Prettier.

## Domain Types (define first, in `src/types`)

All entities carry `tenantId` (multi-tenant ready).

- `Tenant`, `User` (role, teamId, language, location, workload), `Team`
- `Role` = super_admin | admin | manager | team_leader | salesperson, plus a `Permission` matrix (resource × action: view, create, edit, delete, assign, export, import) and `DataScope` (own | team | all)
- `Lead`: id (human-readable like `L-10231`), name, phone, whatsapp, email, company, location, sourceId, campaignId, productInterest, budget, requirement, leadType, tags[], statusId, assignedTo, score (0–100), scoreCategory (hot | warm | cold), qualificationStatus (qualified | not_qualified | needs_info), qualificationAnswers, customFields (Record), duplicateOf?, convertedToCustomerId?, createdAt, lastContactedAt, nextFollowUpAt, firstResponseTimeMins
- `LeadStatus` (configurable, NOT an enum): id, name, color, order, type (open | won | lost | invalid)
- `LeadSource` (website, whatsapp, facebook, instagram, google_ads, linkedin, manual, phone, email, landing_page, import, api — each with an icon)
- `Activity` (typed timeline events: lead_created, assigned, reassigned, status_changed, note, call, whatsapp_sent, whatsapp_received, email_sent, email_received, followup_scheduled, followup_completed, meeting, demo, quotation_sent, score_changed, merged, converted)
- `FollowUp`: lead, type (call | whatsapp | email | meeting | demo | reminder | task), dueAt, assignee, priority, status (pending | done | overdue), notes
- `Task`: title, due date, priority, assignee, status, reminder, related lead/deal
- `Pipeline` + `PipelineStage` (name, color, order, probability), `Deal` (leadId, value, expectedCloseDate, probability, product, ownerId, pipelineId, stageId, expectedRevenue, lostReason?)
- `Customer`, `Company`
- `Campaign` (platform, ad, adSet, spend, plus computed leads/qualified/deals/revenue/CPL/CAC/ROAS)
- `Conversation` + `Message` (channel: whatsapp | email | call; status: sent | delivered | read | failed), `MessageTemplate`
- `Automation` (trigger, conditions[], actions[], enabled, runCount)
- `ScoringRule`, `QualificationQuestion`, `CustomFieldDefinition` (text, number, dropdown, multiselect, date, boolean, currency, file, url), `LostReason`, `AssignmentRule`
- `Notification`, `AuditLog` (user, action, entity, previousValue, newValue, timestamp, ip/device), `SavedView`, `Webhook`, `ApiKey`
- `Paginated<T>`, `ApiResponse<T>`

## Navigation (sidebar)

Dashboard · Follow-ups · Leads · Pipeline · Deals · Customers · Inbox · Tasks · Campaigns · Automations · Reports · Team · Audit Logs · Settings
Topbar: Cmd+K command palette (search leads, jump to pages, quick actions), "+ Add Lead", notifications bell with unread count, AI assistant button, user menu. Sidebar header: workspace (tenant) switcher. Items are hidden or disabled based on role permissions via `RoleGate`.

## Module Specifications

### 1. Auth, Onboarding, Tenancy

Login, Register (creates workspace), Forgot Password, Accept Invite. Short onboarding wizard (workspace name, currency, import leads or skip, invite team). Fake auth persisted in Zustand. Protected routes plus a role switcher in dev mode, so every role's view can be previewed.

### 2. Dashboards (role-based)

- Salesperson: My Leads, New Leads, Today's Follow-ups, Overdue, Hot Leads, Won This Month, Revenue, plus "Call these leads today" list.
- Manager/Admin: Total Leads, Qualified, Open Deals, Won, Lost, Pipeline Value, Weighted Pipeline, Revenue, Conversion Rate, with trend deltas.
- Charts: leads over time, leads by source, funnel by stage, lost reasons, team leaderboard. Date-range filter on everything.

### 3. Follow-ups (primary screen, a first-class page)

- Summary strip: 🔴 Overdue · 🟠 Due Today · 🟡 Tomorrow · 🟢 Upcoming (clickable filters, with counts).
- List grouped by bucket, with type icon, lead, time, priority, assignee, and quick actions (call, WhatsApp, mark done, reschedule, snooze).
- Create follow-up modal (lead, type, date, time, assignee, priority, note). Also a calendar view (month/week).
- Filters: assignee, type, priority.

### 4. Leads

- DataTable: sortable, column picker, row selection, pagination, density toggle, table/card view.
- Powerful FilterBuilder: AND-combined conditions (field, operator, value), e.g. Source = Facebook AND Status = Qualified AND Budget > ₹50,000 AND Assigned To = Rahul AND Created = This Month. Filters show as removable chips.
- Saved Views with preset examples: 🔥 Hot Leads, 📞 Today's Calls, ⚠️ Overdue Leads, 💰 High Value Leads. Users can save, rename, and delete views.
- Bulk actions: assign, change status, add tag, create follow-up, export, delete.
- Create/Edit lead in a right Drawer (all fields from the type, including custom fields rendered dynamically from CustomFieldDefinition). Live duplicate warning while typing phone/email.
- **Duplicate detection UI**: "Possible duplicate lead found" banner, with a side-by-side compare modal and actions: Merge (pick field winners), Keep Separate, Link Records. Also a Duplicates review queue page.
- **Import wizard**: upload CSV/XLSX → column mapping → validation summary (Total, Valid, Duplicates, Invalid, with downloadable error report) → confirm. Export CSV.
- **Lead Detail page**:
  - Header: lead ID, name, status selector (configurable), score badge, owner, quick actions (call, WhatsApp, email, add note, schedule follow-up, convert to deal).
  - Tabs: Overview, Timeline, Follow-ups & Tasks, Conversations, Deal, Qualification, Audit.
  - Unified Activity Timeline (filter by type) + composer (note/call log/email/meeting).
  - Right rail: contact info, source & campaign, tags, custom fields, qualification, assignment history with response time, linked records.
  - Score breakdown card (+10 Facebook, +20 Budget > ₹1L, ...), with 🔥/🟠/🔵 category.
  - AI panel: summary, next recommended action, and sentiment/intent (mock output, see AI section).
  - Marking a lead Lost opens a required Lost Reason dialog. Won triggers a "Convert to Customer" flow, and history is retained.

### 5. Pipeline (Kanban)

Pipeline selector. Columns come from configurable stages, showing count + total value + weighted value. Drag and drop with optimistic update. Cards show name, company, value, owner avatar, score badge, priority, next follow-up date, and overdue indicators. Quick-add in column, filters (owner, source, priority, score). Dropping into a Lost stage opens the Lost Reason dialog. A toggle switches between Leads and Deals boards.

### 6. Deals / Opportunities

List + detail. Fields: value, expected close date, probability, product, owner, pipeline, stage, expected revenue. Header stats: Pipeline Value and Weighted Pipeline. Convert Lead → Opportunity flow.

### 7. Customers

Customer + Company list/detail with the originating lead (full lead history preserved), deals, and a timeline.

### 8. Tasks

Grouped list (Overdue / Today / Upcoming / Completed), priority, assignee, reminder, related lead/deal. Create/edit modal.

### 9. Inbox (Communication)

Three-pane layout: conversation list (filter by channel/unread/assigned), message thread (WhatsApp-style bubbles, delivery ticks, media/document previews, template picker, email composer with template/attachments), and lead info panel. Call log tab (duration, notes, recording player placeholder). Conversations link to the correct lead. All mocked.

### 10. Campaigns

Table + detail: platform, spend, leads, qualified, deals, revenue, CPL, CAC, ROAS, conversion. Funnel chart per campaign (Campaign → Lead → Qualified → Deal → Revenue). Also a WhatsApp campaigns tab (template, audience, status stats).

### 11. Automations (Phase 2 UI)

List with enable toggle + run counts. A visual rule builder using WHEN → IF → THEN: trigger picker (lead created, status changed, lead not contacted for X hours, deal won, ...), condition rows (AND/OR), and ordered actions (assign, send WhatsApp/email, create follow-up/task, notify user/manager, change status, create customer). Include 3 seeded example automations from the spec (new Facebook lead; Won → onboarding; no contact in 2 hours). Run history tab.

### 12. Reports

Tabs: Leads (by source, salesperson, status, campaign, location), Sales (revenue, conversion, pipeline, win rate), Performance (response time, follow-up completion rate, avg deal value), Lost Lead Analysis (reason breakdown %, trends). Sales Performance table per salesperson (leads assigned/contacted, follow-ups, qualified, proposals, won, lost, revenue, conversion, avg response time) with sorting and export. Date range filters.

### 13. Team & Permissions

Members table, invite modal, role selector, teams, workload. Role/permission matrix editor (resource × action checkboxes, data scope: own/team/all). Components must respect permissions: hide or disable actions via `usePermission()` and `<RoleGate>`.

### 14. Settings

Profile · Workspace (name, currency, timezone) · Lead Statuses (add/rename/color/reorder via drag, mark type won/lost/invalid) · Pipelines & Stages (with probability) · Lead Sources · Tags · Custom Fields builder (all 9 types, per entity: lead/deal/customer) · Qualification Questions builder · Scoring Rules builder (conditions → points, hot/warm/cold thresholds) · Assignment Rules (manual, round-robin, by team/location/product/source/language/workload/score, with rule priority ordering) · Lost Reasons · Message Templates · Integrations (WhatsApp, Email, Facebook Lead Ads, Google Ads, LinkedIn, Telephony, as connect cards with mock status) · API Keys & Webhooks (events: lead.created, lead.updated, lead.assigned, lead.status_changed, lead.converted, deal.won, deal.lost) · Notification preferences · Billing & Plan (static pricing cards, usage meter).

### 15. Notifications

Bell dropdown + full page. Salesperson: new lead assigned, follow-up due in 15 min, overdue, WhatsApp reply, new email. Manager: lead uncontacted for 2 hours, X leads overdue, response time increased. Mark read/unread, filter, deep links.

### 16. Audit Logs

Filterable table (user, action, entity, date range) showing previous → new values (e.g. "Status: New → Qualified"), timestamp, and IP/device, with a diff-style detail drawer. Restricted to admin roles.

### 17. AI Features (Phase 3, mock responses)

- AI Lead Summary card, AI Score explanation (✓ reasons), AI Next Action recommendation, Conversation Analysis (sentiment, buying intent, objection, competitor mention, suggested reply).
- AI Assistant side panel (chat UI): "Which leads should I call today?" returns a ranked lead list with reasons. Also AI follow-up message generation and forecast widget.
- All behind an `aiService` interface with canned/mock outputs and a "Generate" loading state. Mark them with a subtle "AI" badge.

### 18. Mobile / PWA

Bottom tab bar on mobile (Home, Follow-ups, Leads, Inbox, More). Lead detail optimized for one-handed use with sticky actions (call via `tel:`, WhatsApp via `wa.me` link, add note, change status, schedule follow-up). Installable PWA manifest, offline shell, touch-friendly targets (44px).

## Data Layer Rules

- One `ApiClient` interface per resource in `services/api`; mock implementations in `services/mock`.
- Seed: about 200 leads across all statuses/sources, 8 users (all 5 roles, 2 teams), 2 tenants (to demo the workspace switcher), 12 statuses (the example set from the spec), 6 pipeline stages, about 300 activities, 80 follow-ups across all buckets, 40 deals, 10 campaigns, 15 conversations, 5 automations, 100 audit logs, deliberate duplicates (same phone, different name).
- Simulated latency 300–700ms, with a dev flag for forced errors.
- Mock layer must enforce tenant scoping and role data scope (own/team/all) the way a real backend would. Never rely on frontend filtering alone as the design intent; centralize it in the mock service.
- Components consume data ONLY via TanStack Query hooks. Central query-key factory. Optimistic updates for drag/drop, status change, and follow-up completion.
- Lead scoring and duplicate checks live in pure, unit-testable functions in `lib/`.

## Code Quality

- Strict TS, Zod schemas as the single source for form types.
- Composable, variant-based primitives (cva). No magic strings: use constants and enums (except statuses, which are data).
- Vitest + Testing Library for the key utilities (scoring, duplicate matching, currency formatting, permissions).
- README: setup, architecture, folder conventions, how to replace the mock API with a real backend, and multi-tenancy notes.

## Delivery Plan (build in this order; STOP after each step for my review)

**Phase 1: MVP (complete and polished first)**

1. Scaffold, Tailwind tokens, folder structure, tooling, `cn`, formatters (INR)
2. UI primitives + hidden `/design-system` page
3. App shell, auth, onboarding, workspace switcher, role/permission system + RoleGate
4. Types, mock backend, API clients, Query hooks
5. Leads list: table, FilterBuilder, saved views, bulk actions, create/edit drawer
6. Duplicate detection UI + import/export wizard
7. Lead detail: timeline, notes, qualification, score card, lost-reason and convert flows
8. Follow-ups page + Tasks + calendar
9. Pipeline Kanban + Deals
10. Dashboards (role-based) + basic Reports + Notifications
11. Team, Settings (statuses, stages, sources, tags, custom fields, assignment rules), Audit Logs
12. Responsive/mobile pass, empty/error states, a11y, PWA setup

**Phase 2: Sales Automation UI** 13. Inbox (WhatsApp/email/calls) + templates 14. Campaigns + advanced Reports + Sales Performance 15. Automation builder + Scoring rules builder 16. Integrations, API keys, webhooks settings

**Phase 3: AI** 17. AI summary, score reasons, next action, conversation analysis, assistant panel, forecasting widget

Begin with Step 1 only. Before writing code, briefly list the plan and any assumptions you're making.
