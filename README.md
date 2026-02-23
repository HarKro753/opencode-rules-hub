# opencode-rules-hub

Centralized rules management for your AI coding agents.

Define coding rules once, share them across every project. opencode-rules-hub is a self-hosted platform that stores rule sets as plain markdown files and serves them to any repo via a lightweight plugin. Your AI agents get consistent, up-to-date coding standards injected into every session — without copy-pasting rules between projects.

## Architecture

The platform is a monorepo with three packages:

- **`packages/server`** — TypeScript HTTP server. Stores rules as `.md` files on disk. Exposes a REST API for CRUD operations. No database.
- **`packages/dashboard`** — Next.js web UI. Browse, create, edit, and delete rule sets through a clean dark-mode interface.
- **`packages/plugin`** — OpenCode plugin. Fetches rules from the server on session compaction, caches them locally, and injects them into the AI agent's context.

## Quick start

### 1. Start the server

```bash
cd packages/server
npm install
npm run dev
```

The server runs on `http://localhost:3847` by default. Set `PORT` to change it. Set `API_KEY` to secure write operations (defaults to `changeme`).

### 2. Open the dashboard

```bash
cd packages/dashboard
npm install
npm run dev
```

Opens on `http://localhost:3848`. Set `NEXT_PUBLIC_RULES_SERVER_URL` if your server runs on a different host.

### 3. Configure a project

Add a config file to any repo that should use your rules:

```json
// .opencode/rules.json
{
  "server": "http://localhost:3847",
  "apiKey": "your-api-key",
  "sets": ["typescript", "company-conventions"]
}
```

### 4. Install the plugin

Add the plugin to your `opencode.json`:

```json
{
  "plugin": ["opencode-rules-hub"]
}
```

On the next session compaction, the plugin will fetch your configured rule sets and inject them into the AI agent's context. Rules are cached locally in `.opencode/rules-local.md` with infinite TTL — they only refetch when you run `/rules-sync`.

## Plugin tools

| Tool           | Description                                              |
| -------------- | -------------------------------------------------------- |
| `/rules-sync`  | Force re-fetch all rule sets from the server             |
| `/rules`       | Display the current locally cached rules                 |

## API reference

All mutating routes require `Authorization: Bearer <api-key>`. Read routes are public.

| Method   | Endpoint                  | Description                          |
| -------- | ------------------------- | ------------------------------------ |
| `GET`    | `/health`                 | Health check                         |
| `GET`    | `/sets`                   | List all available sets with metadata |
| `GET`    | `/rules?sets=ts,go`       | Get merged markdown for multiple sets |
| `GET`    | `/rules/:set`             | Get a single rule set                |
| `POST`   | `/rules/:set`             | Create a rule set (body: markdown)   |
| `PUT`    | `/rules/:set`             | Update a rule set (body: markdown)   |
| `DELETE` | `/rules/:set`             | Delete a rule set                    |

### Examples

```bash
# List sets
curl http://localhost:3847/sets

# Get a single set
curl http://localhost:3847/rules/typescript

# Get multiple sets merged
curl "http://localhost:3847/rules?sets=typescript,general"

# Create a new set
curl -X POST http://localhost:3847/rules/go \
  -H "Authorization: Bearer changeme" \
  -H "Content-Type: text/markdown" \
  -d "# Go Rules

- Use gofmt for formatting.
- Handle errors explicitly."

# Delete a set
curl -X DELETE http://localhost:3847/rules/go \
  -H "Authorization: Bearer changeme"
```

## Rule storage

Rules are plain markdown files stored in `packages/server/data/`:

```
data/
  general.md
  typescript.md
  company-conventions.md
```

Each file is a markdown document with a heading and a list of rules:

```markdown
# TypeScript Rules

- Use named exports — default exports make refactoring harder.
- Avoid the `any` type — use `unknown` and narrow explicitly.
- Use `import type` for type-only imports.
```

No database, no migrations, no ORM. Just files.

## Self-hosting

The server is designed to be self-hosted. Run it behind a reverse proxy, set a strong `API_KEY`, and point your projects at it. The server is stateless apart from the data directory — back up `data/` and you have everything.

```bash
PORT=3847 API_KEY=your-secret-key DATA_DIR=./data node dist/index.js
```

## Development

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Dev mode (server)
npm run dev:server

# Dev mode (dashboard)
npm run dev:dashboard
```

## License

MIT
