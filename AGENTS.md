# AGENTS.md

This repository is `modocn`, Modoterra's custom React component registry delivered as a shadcn/ui-compatible registry with a Vite + React + TypeScript docs and demo site.
Use this file as the default operating guide for agentic work in this repo.

## Rule Sources

- No `.cursor/rules/` files were present when this guide was written.
- No `.cursorrules` file was present.
- No `.github/copilot-instructions.md` file was present.
- If any of those files appear later, treat them as repository-specific guidance and follow them first.
- The repo-local `opencode.json` is the current source of truth for the Playwright MCP server config.
- Do not edit `opencode.json` unless the user asks for MCP changes.

## Repository Map

- `src/main.tsx` bootstraps React and the router.
- `src/app.tsx` renders the demo landing page and sections.
- `src/demos/` contains demo compositions for the registry components.
- `src/lib/mock-stream.ts` contains deterministic streaming and SSE mock helpers.
- `registry/` contains shadcn registry source that should stay buildable.
- `vite.config.ts` defines the Vite alias and plugin setup.
- `index.html` is the app shell and Vite entry point.
- `package.json` defines the only supported repo scripts.
- `tsconfig.json` uses strict TypeScript with the `@/*` path alias.

## Commands

- Start the dev server: `npm run dev`
- Start the dev server on all interfaces: `npm run dev -- --host 0.0.0.0`
- Build the app and type-check: `npm run build`
- Type-check only: `npx tsc --noEmit`
- Preview the production build: `npm run preview`
- Build the registry output: `npm run registry:build`
- Install dependencies: `npm install`
- There is no lint script in `package.json` right now.
- There is no repo-local automated test script right now.

## Targeted Checks

- Prefer the narrowest useful command instead of running unrelated work.
- If a test framework is added later, run a single file or a single matching test first.
- Example single-file Playwright command, if tests are ever reintroduced: `npx playwright test path/to/file.spec.ts`
- Example single-test filter, if tests are ever reintroduced: `npx playwright test path/to/file.spec.ts -g "exact case name"`
- For browser verification today, use Playwright MCP against the running Vite app.
- Use `npm run build` as the main repository health check.
- Use `npx tsc --noEmit` when you only need a fast type check.
- Use `npm run preview` when you need to inspect built output rather than source output.

## Playwright MCP And Vite

- Always verify that Vite is already running before using Playwright MCP.
- Reuse the existing Vite URL printed by the dev server.
- Do not start Vite from a Playwright MCP or browser task.
- If no Vite instance is running, stop and report the blocker instead of launching one.
- If the browser session dies, restart the browser session, not the app server.
- If Vite selected a non-default port, use that exact port.
- Do not assume `localhost:5173`; confirm the active port from the running dev server.
- Keep browser smoke checks focused on page load, console output, and snapshots.
- Do not add a second browser automation configuration inside this repo.
- Keep browser automation at the MCP layer; do not reintroduce local Playwright test dependencies unless asked.

## TypeScript Rules

- Use strict TypeScript assumptions everywhere.
- Prefer explicit prop types for components that accept more than trivial props.
- Keep `type` imports separate from runtime imports when practical.
- Avoid `any`, implicit `any`, and broad `unknown` escape hatches.
- Prefer narrow unions and inferred literal types over hand-wavy object shapes.
- Use `React.ReactNode` for children when a component accepts rendered content.
- Keep return values and callback signatures obvious from the code.
- Use `as const` for literal CSS values only when it preserves a useful type.
- Prefer `Record<string, CSSProperties>` for inline style maps, matching the existing codebase.
- Keep type assertions minimal and local.

## React Rules

- Use functional components.
- Prefer named exports for components and helpers that are reused.
- Keep hooks at the top level and follow the rules of hooks strictly.
- Keep state close to the component that owns it.
- Use `useEffect` only for external synchronization, not for derived data.
- Clean up effects that create listeners, observers, timers, or subscriptions.
- Use `useRef` for DOM references and imperative handles.
- Avoid unnecessary `useMemo` and `useCallback` unless they clarify behavior or stabilize a dependency.
- Keep components small and readable rather than deeply abstracted.
- Favor composition over custom framework-like wrappers.

## Imports

- Group external imports first, then internal imports.
- Keep a blank line between import groups when it improves readability.
- Use `import type` for type-only imports.
- Prefer the `@/` alias for repo-root imports.
- Use relative imports for nearby files inside the same feature area.
- Do not introduce deep relative paths when the alias already exists.
- Remove unused imports immediately.
- Keep import lists short and direct.

## Formatting

- Use double quotes.
- Do not use semicolons.
- Use 2-space indentation.
- Keep trailing commas in multiline structures.
- Keep JSX props readable by breaking long elements over multiple lines.
- Preserve existing line wrapping style in nearby code.
- Do not reformat unrelated files as part of a small change.
- Keep inline style objects close to the component they support.
- Prefer the current lightweight formatting style over introducing new tooling.
- Let the existing code style drive the edit, not the other way around.

## Naming

- Components use `PascalCase`.
- Hooks use `useX`.
- Helpers and local variables use `camelCase`.
- Module-level constants use `UPPER_SNAKE_CASE` when they are fixed values.
- Demo files use `kebab-case` filenames.
- Style maps are usually named `styles`.
- Keep demo component names descriptive of the behavior they show.
- Keep helper names concrete and domain-specific.

## Styling And Layout

- The current app uses inline `style` props heavily.
- Follow the existing demo approach unless a broader styling refactor is explicitly requested.
- Keep visual changes consistent with the dark, minimal demo aesthetic already in place.
- Prefer self-contained styles over adding new CSS files for small demo changes.
- When using inline styles, keep the style object near the component.
- Use existing spacing, border radius, and color patterns as the default language.
- Keep demo layouts responsive enough to work on narrow and wide viewports.
- Do not introduce unrelated design-system abstractions.

## Error Handling

- Prefer early returns over nested control flow.
- Check for nullish refs before using DOM nodes.
- Do not swallow errors silently.
- If an async path can fail, make the failure visible in the UI or log it clearly.
- Avoid broad `try/catch` blocks around code that should fail loudly during development.
- Keep mocked async helpers deterministic so failures are reproducible.
- Use cleanup functions for anything that could leak across renders.

## Demos And Mocks

- `src/demos/` should stay focused on showcasing registry components.
- Keep demo data and mocked transport logic in `src/lib/mock-stream.ts` unless there is a strong reason to move it.
- Preserve the deterministic behavior of the mock stream helpers.
- Keep demo routes wired through `src/app.tsx`.
- Treat the demo page as the primary manual verification surface.
- If a change affects a shared helper, check all demos that rely on it.

## Registry And Generated Code

- `registry/` is part of the buildable component surface.
- Keep registry changes compatible with `npm run registry:build`.
- Avoid hand-editing generated outputs unless that is the intended source of truth.
- Keep generated component APIs aligned with the demo usage in `src/demos/`.
- Do not add framework churn that makes the registry harder to consume.

## Change Discipline

- Make the smallest correct change that solves the problem.
- Search existing code before inventing a new pattern.
- Match nearby style instead of restyling the whole file.
- Avoid unrelated refactors.
- Preserve the repository's simple dependency surface.
- Do not reintroduce `playwright` or `@playwright/test` locally unless the user asks.
- Keep `@playwright/mcp` managed in `opencode.json` instead of in-repo test tooling.
- Update demo copy only when it reflects real behavior.
- Verify with `npm run build` after substantive changes.
- Use Playwright MCP against the running Vite server for browser confirmation when relevant.

## Working Defaults

- Read the relevant files before editing.
- Prefer clarity over cleverness.
- Keep modules focused on one responsibility.
- Leave comments only when they explain non-obvious intent.
- Do not add defensive compatibility code unless there is a concrete need.
- Keep APIs stable unless the task explicitly calls for a breaking change.
- If the task is ambiguous, ask one short question instead of guessing.
- When in doubt, favor the existing code style over a new house style.
