# LeadFlow

LeadFlow is a multi-tenant lead management app for sales teams. Phase 1 runs entirely in the browser against an in-memory mock API. Screens talk to TanStack Query hooks, and those hooks are the only callers of `services/api`.

## Setup

```bash
npm install
npm run icons
npm run dev
```

The app opens at `http://localhost:5173`. In development, the sign-in screen lists demo accounts. The shared password is `password123`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | ESLint, including jsx-a11y |
| `npm run test` | Vitest, once |
| `npm run test:a11y` | axe on the key pages (also included in `npm run test`) |
| `npm run build` | Typecheck and production build, including the service worker |
| `npm run preview` | Serve the production build |
| `npm run analyze` | Production build plus `dist/stats.html` |
| `npm run icons` | Rasterize `public/icons/icon.svg` to 192, 512, and maskable PNGs |

## Architecture

UI components call feature hooks. Hooks call `services/api`. The mock implements that same interface and is never imported from a component.

```text
components → features/*/hooks → services/api → services/mock
```

Statuses, sources, and stages are workspace data, not TypeScript enums. Money is formatted with `formatCurrency` / `formatINR` in `src/lib/format`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Permissions and tenancy

Every cached query is scoped by tenant, user, and role. The mock enforces tenant isolation, the role's data scope (own, team, or all), and permission checks before a write. Activity and audit rows are written with the change. Duplicate detection, scoring, and assignment run inside the mock the same way a backend would.

There is no in-app role switcher. Sign in as a different demo account to change role.

## Testing

`npm run test` covers unit and page tests. `npm run test:a11y` runs axe against login, the dashboard, the leads list, a lead, follow-ups, the pipeline, and the profile form, and fails on serious or critical violations. Color contrast is not measured inside jsdom; the primary color is darkened so white label text meets WCAG AA.

## Replacing the mock API

Implement `ApiClient` in `src/services/api/api.ts` (and the resource modules it composes) and swap the binding in `src/services`. Keep these guarantees:

- Tenant isolation on every read and write
- Role data scope (own / team / all)
- Permission checks before mutations
- Activity and audit writes for changes
- Duplicate checks, lead scoring, and assignment rules
- No caching of authenticated responses that is not scoped by tenant

Resource modules: `auth`, `leads`, `followups`, `tasks`, `deals`, `customers`, `pipelines`, `campaigns`, `conversations`, `automations`, `notifications`, `reports`, `saved-views`, `team`, `settings`, `config`, `templates`, `audit-logs`.

A real API should be network-first. Do not cache authenticated responses in the service worker unless the cache key includes the tenant. The current service worker precaches the app shell and may cache fonts and images only.
