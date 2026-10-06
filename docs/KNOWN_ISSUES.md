# Known issues

## Deferred on purpose

- **Import wizard.** The Leads toolbar Import button is disabled. `xlsx` and `papaparse` are installed and unused. The mapping targets live in `src/features/leads/config/import-targets.ts` and `useImportLeads` exists, but the wizard is not built.
- **No role switcher.** Change role by signing in as another development demo account. The login screen lists those accounts only when `import.meta.env.DEV` is true.
- **Phase 2 placeholders.** Customers, Inbox, Campaigns, and Automations render `ModulePlaceholder`. Scoring, templates, integrations, and API keys in settings render `ComingSoonPage`.

## Tooling

- **jsx-a11y peer range.** `eslint-plugin-jsx-a11y@6.10.2` declares ESLint 9 as its newest peer. This repo uses ESLint 10, so the plugin is installed with `--legacy-peer-deps`. The recommended rules run. Do not silence a violation to go green.
- **react-hooks/incompatible-library.** `form.watch()` and `useVirtualizer` produce warnings that existed before this pass. ESLint still exits 0. They are not disabled.
- **axe color contrast.** Page tests turn off `color-contrast` because jsdom does not compute Tailwind. `--primary` is `243 75% 42%` so white text on primary is darker than the previous `239 84% 67%` (about 4.4:1) and clears 4.5:1.
- **Lighthouse.** Not run against `vite preview` in the Phase 1 pass. Scores are not recorded. The measured bundle size is in `docs/PHASE1_AUDIT.md`.
- **Initial JavaScript.** The preloaded entry is about 463 KB gzipped. The ~250 KB target is missed because Faker and Zod ship inside the startup chunk with the in-memory mock.
