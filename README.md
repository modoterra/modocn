# modocn

Modoterra's custom React component registry.

`modocn` is a Vite + React + TypeScript site that showcases and serves a
shadcn/ui-compatible registry of custom React components. The current wave of
components focuses on chat, streaming, virtualization, and markdown-rich UI,
but the product is broader than AI chat alone.

Site:
- `https://modocn.mdtrr.com`

Repository:
- `https://github.com/modoterra/modocn`

## Positioning

This repo is for:
- custom React components Modoterra wants to publish and reuse
- source-available registry blocks teams can own after install
- richer interaction patterns that are usually harder than commodity UI

This repo is not just:
- a chat demo
- an AI-only component site
- a thin marketing shell around npm packages

## Local development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build the registry and site:

```bash
npm run build
```

Build registry output only:

```bash
npm run registry:build
```

## Registry URLs

Example install command:

```bash
npx shadcn add https://modocn.mdtrr.com/r/chat-full.json
```

Other blocks are served from the same pattern:

```text
https://modocn.mdtrr.com/r/<name>.json
```

## Deployment

The repo is prepared for GitHub Pages with a custom domain.

Implemented in-repo:
- GitHub Actions workflow: `.github/workflows/deploy-pages.yml`
- custom domain file: `public/CNAME`
- SPA fallback for client-side routing: `public/404.html`
- production build includes fresh registry payloads via `npm run registry:build`

### GitHub setup

In GitHub for `modoterra/modocn`:

1. Enable GitHub Pages for the repository
2. Use GitHub Actions as the Pages source
3. Ensure the `Deploy Pages` workflow can run on `main`

### DNS setup

Point `modocn.mdtrr.com` to GitHub Pages using the standard custom-domain DNS
records for your Pages host.

Once DNS is correct, GitHub should detect the custom domain from `CNAME`.

## Build notes

`npm run build` does two important things:

1. regenerates the shadcn registry payloads
2. builds the docs/demo site

That means the hosted `/r/*.json` endpoints stay aligned with the current
source instead of drifting behind the docs.

## Current focus areas

The current component collection includes:
- `chat-box`
- `chat-input`
- `chat-message`
- `chat-messages`
- `chat-full`
- `streaming-text`
- `transport-openai`

The current demos include:
- chat composition
- streaming presets
- virtualization proof

## Branding note

`modocn` is the public product name.

It is intended to read as a Modoterra-branded component surface and leaves room
for the registry to grow beyond the initial chat-heavy collection.
