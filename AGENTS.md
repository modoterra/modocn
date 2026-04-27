# AGENTS.md

Modoterra's custom React component registry (`modocn`), delivered as a shadcn/ui-compatible registry with a Vite + React + TypeScript demo site.

## Rule Sources

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` files exist.
- If any appear later, treat them as repo-specific guidance and follow them first.
- `opencode.json` is the MCP config source of truth; do not edit it unless asked.

## Repository Map

- `src/main.tsx` — React bootstrap + router.
- `src/app.tsx` — demo landing page, routes.
- `src/demos/` — demo compositions for registry components.
- `src/lib/mock-stream.ts` — deterministic streaming/SSE mock helpers.
- `registry/` — shadcn registry source (must stay buildable).
- `components/ui/` — shared UI primitives (button, card, input, select, etc.).
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `vite.config.ts` — Vite alias (`@/` → repo root) and plugin setup.
- `tsconfig.json` — strict TypeScript, `@/*` path alias.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Dev server (all interfaces) | `npm run dev -- --host 0.0.0.0` |
| Build + type-check | `npm run build` |
| Type-check only | `npx tsc --noEmit` |
| Preview production build | `npm run preview` |
| Build registry output | `npm run registry:build` |
| Install deps | `npm install` |

- There is **no lint script** and **no test script** in `package.json`.
- There is **no linter or formatter config** (no ESLint, Prettier, Biome). Style is by convention.
- There are **no test files or test configs** (no Jest, Vitest, or local Playwright tests).
- If a test framework is added later, run a single file first: `npx playwright test path/to/file.spec.ts`
- Single-test filter: `npx playwright test path/to/file.spec.ts -g "exact case name"`
- Use `npm run build` as the primary repo health check after substantive changes.

## Commits

- Husky runs a `commit-msg` hook that invokes commitlint.
- Commit messages **must** follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, etc.).
- There is no pre-commit hook (no lint-staged, no auto-formatting).

## Playwright MCP

- Verify Vite is already running before using Playwright MCP.
- Reuse the exact URL/port printed by the dev server; do not assume `localhost:5173`.
- Do not start Vite from a browser task; report the blocker instead.
- If the browser session dies, restart the session, not the app server.
- Keep browser checks focused on page load, console output, and snapshots.
- Do not reintroduce local `playwright` or `@playwright/test` deps unless asked.

## TypeScript

- Strict mode is enabled; honor it everywhere.
- Prefer explicit prop types for non-trivial components.
- Keep `type` imports separate: `import type { Foo } from "..."`.
- Avoid `any`, implicit `any`, and broad `unknown`.
- Prefer narrow unions and literal types over loose object shapes.
- Use `React.ReactNode` for children props.
- Use `as const` for literal CSS values when it preserves a useful type.
- Use `Record<string, CSSProperties>` for inline style maps.
- Keep type assertions minimal and local.

## React

- Functional components only, with named exports.
- Hooks at the top level; follow rules of hooks strictly.
- State close to the owning component.
- `useEffect` only for external sync, not derived data; always clean up side effects.
- `useRef` for DOM refs and imperative handles.
- Avoid gratuitous `useMemo`/`useCallback`.
- Favor composition over deep abstraction.

## Imports

- External imports first, then internal imports, blank line between groups.
- `import type` for type-only imports (separate statement preferred).
- `@/` alias for cross-boundary imports; relative imports within the same feature.
- No deep relative paths when the alias works.
- Remove unused imports immediately.

## Formatting

- **Double quotes**, **no semicolons**, **2-space indentation**.
- Trailing commas in multiline structures.
- Break long JSX elements over multiple lines.
- Preserve nearby code's wrapping style; do not reformat unrelated files.
- No new formatter tooling unless explicitly requested.

## Naming

- `PascalCase` — components.
- `useX` — hooks.
- `camelCase` — helpers, local variables.
- `UPPER_SNAKE_CASE` — module-level fixed constants.
- `kebab-case` — demo filenames.
- Style maps named `styles`.

## Styling

- Inline `style` props are the dominant pattern; follow it.
- Keep styles self-contained near the component; avoid new CSS files for small changes.
- Match the existing dark, minimal aesthetic.
- Keep layouts responsive for narrow and wide viewports.
- Do not introduce unrelated design-system abstractions.

## Error Handling

- Early returns over nested control flow.
- Check nullish refs before DOM access.
- Never swallow errors silently; surface failures in UI or logs.
- Avoid broad `try/catch` around code that should fail loudly in dev.
- Keep mock helpers deterministic for reproducible failures.
- Clean up anything that could leak across renders.

## Demos, Mocks, and Registry

- `src/demos/` showcases registry components; keep it focused.
- Mock transport logic lives in `src/lib/mock-stream.ts`.
- Demo routes are wired through `src/app.tsx`.
- `registry/` must stay compatible with `npm run registry:build`.
- Keep generated component APIs aligned with demo usage.
- If a change touches a shared helper, verify all demos that use it.

## Change Discipline

- Smallest correct change that solves the problem.
- Search existing code before inventing a new pattern.
- Match nearby style; avoid unrelated refactors.
- Preserve the simple dependency surface.
- Verify with `npm run build` after substantive changes.
- If the task is ambiguous, ask one short question instead of guessing.
- Read relevant files before editing; prefer clarity over cleverness.
- Leave comments only for non-obvious intent.
