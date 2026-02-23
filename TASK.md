# Task: Build opencode-rules-hub

## What you're building

A centralized rules management platform for OpenCode. Three packages in a monorepo:

1. **`packages/server`** — TypeScript HTTP server. Stores rules as plain `.md` files on disk. REST API.
2. **`packages/dashboard`** — Next.js web UI. Browse, create, edit, delete rules. Connects to the server.
3. **`packages/plugin`** — OpenCode plugin. Fetches rules from server on session start, injects them into context. Persists rules locally (infinite TTL — no expiry, never refetch unless manually triggered).

## Architecture

### Rule storage model

Rules live on the server as markdown files, organized by set name:

```
server/data/
  typescript.md
  go.md
  company-conventions.md
  nextjs.md
```

Each file is a markdown list of rules:

```markdown
# TypeScript Rules

- Use named exports — default exports make refactoring harder.
- Avoid the `any` type — use `unknown` and narrow explicitly.
- Use `import type` for type-only imports.
```

No database. No SQLite. Just files.

### Project integration

A repo that uses the platform adds a single config file:

```json
// .opencode/rules.json
{
  "server": "http://localhost:3847",
  "apiKey": "your-api-key",
  "sets": ["typescript", "company-conventions"]
}
```

### Plugin behavior

On `experimental.session.compacting`:
1. Read `.opencode/rules.json` from the project root
2. Fetch the requested rule sets from the server
3. Persist them to `.opencode/rules-local.md` (plain markdown, for offline use)
4. Inject the content into `output.context`

On subsequent compactions: read from `.opencode/rules-local.md` first. Only refetch from server if the file doesn't exist OR if the user explicitly runs `/rules-sync`. TTL is infinite — rules only update when you tell them to.

## Package structure

```
opencode-rules-hub/
  packages/
    server/
      src/
        index.ts          # Entry point, starts HTTP server
        routes/
          rules.ts        # CRUD routes for rule sets
          sets.ts         # List available sets
          health.ts       # GET /health
        storage/
          file-store.ts   # Read/write .md files to disk
        auth/
          api-key.ts      # Simple API key middleware
      data/               # Default rule files (pre-seeded)
        general.md
        typescript.md
      package.json
      tsconfig.json

    dashboard/
      src/
        app/
          page.tsx          # Rule sets overview
          sets/[set]/
            page.tsx        # Rules in a specific set
            edit/page.tsx   # Edit a rule set (markdown editor)
      package.json
      tsconfig.json
      next.config.ts

    plugin/
      src/
        index.ts          # Plugin entry point + export
        config.ts         # Read .opencode/rules.json
        fetcher.ts        # HTTP client for rules server
        storage.ts        # Read/write .opencode/rules-local.md
        injector.ts       # Build context injection string
      package.json
      tsconfig.json

  package.json            # Workspace root (npm workspaces)
  tsconfig.json           # Root tsconfig (references all packages)
  README.md
  .gitignore
```

## Server API

```
GET    /health                          → { status: "ok" }
GET    /sets                            → string[]  (list of available set names)
GET    /rules?sets=typescript,go        → markdown string (all requested sets merged)
GET    /rules/:set                      → markdown string (single set)
POST   /rules/:set                      → create/overwrite a rule set (body: markdown text)
PUT    /rules/:set                      → same as POST
DELETE /rules/:set                      → delete a rule set
```

All mutating routes require `Authorization: Bearer <api-key>` header.
Read routes (`GET`) are public (no auth required for self-hosted simplicity).

## Dashboard requirements

- **Home page**: grid of rule set cards. Each card shows set name, rule count, last modified.
- **Set page**: renders the markdown rules for a set. "Edit" button opens the editor.
- **Edit page**: plain textarea (or simple markdown editor) to edit the set's content. Save calls `PUT /rules/:set`.
- **New set**: a button on the home page to create a new set (enter name → edit page).
- **Delete**: button on each set card or set page.
- Dashboard reads server URL from `NEXT_PUBLIC_RULES_SERVER_URL` env var (defaults to `http://localhost:3847`).
- Minimal, clean UI. Dark mode support. No over-engineering on the UI.

## Plugin requirements

- TypeScript, exports `RulesHubPlugin` as a named export
- Reads `.opencode/rules.json` from the project (uses `directory` from plugin context)
- If `.opencode/rules.json` doesn't exist: plugin loads silently, does nothing
- Registers a `/rules-sync` custom tool: manually triggers a fresh fetch from server
- Registers a `/rules` custom tool: prints current local rules to the user
- See `.claude/skills/opencode-plugins/SKILL.md` for full plugin API reference

## Pre-seeded data

Create these two rule files in `packages/server/data/`:

**general.md:**
```markdown
# General Rules

- Prefer explicit error handling over silent failures.
- Always explain the *why* when making architectural decisions — not just the what.
- Write code for the next developer, not just for the machine.
```

**typescript.md:**
```markdown
# TypeScript Rules

- Use named exports — default exports make refactoring harder.
- Avoid the `any` type — use `unknown` and narrow explicitly.
- Use `import type` for type-only imports.
- Prefer `const` — use `let` only when reassignment is necessary, never `var`.
- Write strongly typed code — no implicit `any`, strict mode on.
- Colocate tests with source files (`module.ts`, `module.test.ts`).
```

## README

Write a professional README (see `CLAUDE.md` and existing `opencode-agent-context` README for style reference). Include:
- Tagline: "Centralized rules management for your AI coding agents"
- What it does (one paragraph)
- Architecture overview (server + dashboard + plugin)
- Quick start: how to run the server, open the dashboard, configure a repo, and install the plugin
- API reference (the routes listed above)
- Self-hosting note
- License: MIT

## Quality bar

- `npm run build` passes in all packages
- TypeScript strict mode, zero `any`
- Tests for: `file-store.ts` (read/write rules), `config.ts` (parse rules.json), `fetcher.ts` (mock HTTP calls)
- Server runs on port `3847` by default (configurable via `PORT` env var)
- Dashboard runs on port `3848` by default

## Git & delivery

- Work on `main` branch, trunk-based development
- `git push origin main` after every meaningful commit — not just at the end
- When fully done, send notification:
  `openclaw message send --target 8186358692 --channel telegram --message "✅ Done: opencode-rules-hub pushed to main — ready for review"`
