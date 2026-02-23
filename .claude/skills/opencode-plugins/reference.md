# OpenCode Plugin Events Reference

Complete reference of all subscribable events, hook signatures, SDK client APIs, and the `tool()` helper.

## Event Categories

### Command Events

| Event              | Description                            |
| ------------------ | -------------------------------------- |
| `command.executed` | Fired when a slash command is executed |

### File Events

| Event                  | Description                    |
| ---------------------- | ------------------------------ |
| `file.edited`          | A file was edited by a tool    |
| `file.watcher.updated` | File watcher detected a change |

### Installation Events

| Event                  | Description                       |
| ---------------------- | --------------------------------- |
| `installation.updated` | OpenCode installation was updated |

### LSP Events

| Event                    | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `lsp.client.diagnostics` | LSP client received diagnostics (errors, warnings) |
| `lsp.updated`            | LSP server state was updated                       |

### Message Events

| Event                  | Description                     |
| ---------------------- | ------------------------------- |
| `message.part.removed` | A part of a message was removed |
| `message.part.updated` | A part of a message was updated |
| `message.removed`      | A message was removed           |
| `message.updated`      | A message was updated           |

### Permission Events

| Event                | Description                               |
| -------------------- | ----------------------------------------- |
| `permission.asked`   | A permission prompt was shown to the user |
| `permission.replied` | The user responded to a permission prompt |

### Server Events

| Event              | Description                   |
| ------------------ | ----------------------------- |
| `server.connected` | Server connection established |

### Session Events

| Event               | Description                             |
| ------------------- | --------------------------------------- |
| `session.created`   | A new session was created               |
| `session.compacted` | Session context was compacted           |
| `session.deleted`   | A session was deleted                   |
| `session.diff`      | Session diff was generated              |
| `session.error`     | Session encountered an error            |
| `session.idle`      | Session finished processing (went idle) |
| `session.status`    | Session status changed                  |
| `session.updated`   | Session was updated                     |

### Todo Events

| Event          | Description             |
| -------------- | ----------------------- |
| `todo.updated` | A todo item was updated |

### Shell Events

| Event       | Description                                               |
| ----------- | --------------------------------------------------------- |
| `shell.env` | Shell environment is being prepared (hook to inject vars) |

### Tool Events

| Event                 | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `tool.execute.before` | Fired before a tool executes (can modify args or throw to block) |
| `tool.execute.after`  | Fired after a tool completes (can modify result)                 |

### TUI Events

| Event                 | Description                         |
| --------------------- | ----------------------------------- |
| `tui.prompt.append`   | Text was appended to the TUI prompt |
| `tui.command.execute` | A TUI command was executed          |
| `tui.toast.show`      | A toast notification was displayed  |

---

## Hook Signatures

### `event` (generic)

```ts
event: async ({ event }) => {
  // event.type: string - the event name (e.g., "session.idle")
  // event: full event payload
};
```

### `tool.execute.before`

```ts
"tool.execute.before": async (input, output) => {
  // input.tool: string - tool name (e.g., "read", "bash", "write")
  // output.args: object - mutable tool arguments
  // Throw an Error to block execution
}
```

### `tool.execute.after`

```ts
"tool.execute.after": async (input, output) => {
  // input.tool: string - tool name
  // input.result: the tool's return value
  // output.result: mutable - can modify the result
}
```

### `shell.env`

```ts
"shell.env": async (input, output) => {
  // input.cwd: string - current working directory
  // output.env: object - mutable environment variables
  // Set output.env.KEY = "value" to inject
}
```

### `experimental.session.compacting`

```ts
"experimental.session.compacting": async (input, output) => {
  // output.context: string[] - array of context strings to include
  // output.prompt: string | undefined - set to replace entire compaction prompt
  // When output.prompt is set, output.context is ignored
}
```

---

## SDK Client API (available in plugin context as `client`)

### App

```ts
await client.app.log({
  body: {
    service: "my-plugin",
    level: "info", // "debug" | "info" | "warn" | "error"
    message: "Log message",
    extra: { key: "value" },
  },
});

const agents = await client.app.agents();
```

### Sessions

```ts
const session = await client.session.create({ body: { title: "My session" } });
const sessions = await client.session.list();
const result = await client.session.prompt({
  path: { id: session.id },
  body: {
    model: { providerID: "anthropic", modelID: "claude-3-5-sonnet-20241022" },
    parts: [{ type: "text", text: "Hello!" }],
  },
});

// Inject context without AI response
await client.session.prompt({
  path: { id: session.id },
  body: {
    noReply: true,
    parts: [{ type: "text", text: "Context injection" }],
  },
});

await client.session.abort({ path: { id: session.id } });
await client.session.delete({ path: { id: session.id } });
```

### Files

```ts
const textResults = await client.find.text({
  query: { pattern: "function.*opencode" },
});
const files = await client.find.files({
  query: { query: "*.ts", type: "file" },
});
const content = await client.file.read({ query: { path: "src/index.ts" } });
```

### TUI

```ts
await client.tui.appendPrompt({ body: { text: "Appended text" } });
await client.tui.showToast({ body: { message: "Done!", variant: "success" } });
await client.tui.submitPrompt();
await client.tui.clearPrompt();
```

### Events

```ts
const events = await client.event.subscribe();
for await (const event of events.stream) {
  console.log("Event:", event.type, event.properties);
}
```

---

## `tool()` Helper Reference

The `tool()` function from `@opencode-ai/plugin` creates custom tools.

### Import

```ts
import { tool } from "@opencode-ai/plugin";
```

### Schema Types

`tool.schema` is Zod. Available types:

```ts
tool.schema.string(); // string argument
tool.schema.number(); // number argument
tool.schema.boolean(); // boolean argument
tool.schema.enum(["a", "b", "c"]); // enum argument
tool.schema.array(tool.schema.string()); // array of strings
tool.schema.object({ key: tool.schema.string() }); // nested object
```

Add descriptions with `.describe("...")`:

```ts
args: {
  query: tool.schema.string().describe("SQL query to execute"),
  limit: tool.schema.number().describe("Max rows to return").optional(),
}
```

### Execute Context

The `execute` function receives `(args, context)`:

```ts
async execute(args, context) {
  context.agent       // Current agent name
  context.sessionID   // Current session ID
  context.messageID   // Current message ID
  context.directory   // Session working directory
  context.worktree    // Git worktree root
}
```

### Tool Definition Shape

```ts
tool({
  description: string, // Required: what the tool does
  args: {
    // Required: Zod schema object
    [key]: ZodType,
  },
  execute: async (args, context) => {
    return string | number | object; // Return value sent to LLM
  },
});
```

---

## Bun Shell API (`$`)

Available in plugin context for executing commands:

```ts
// Simple command
const output = await $`ls -la`.text();

// With working directory
const result = await $`git status`.cwd(directory).text();

// Quiet mode (suppress output)
await $`npm install`.quiet();

// Check exit code
const proc = await $`test -f file.txt`.nothrow();
if (proc.exitCode === 0) {
  /* file exists */
}
```

See [Bun Shell documentation](https://bun.sh/docs/runtime/shell) for full API.

---

## npm Plugin Installation

npm plugins specified in `opencode.json` are auto-installed:

- **Install location**: `~/.cache/opencode/node_modules/`
- **Package manager**: Bun
- **Timing**: Installed at OpenCode startup
- **Caching**: Dependencies are cached between runs
- Supports both regular (`opencode-wakatime`) and scoped (`@my-org/plugin`) packages

---

## Community Plugins

Notable community plugins for reference:

| Plugin                             | Purpose                                      |
| ---------------------------------- | -------------------------------------------- |
| `opencode-wakatime`                | Track usage with Wakatime                    |
| `opencode-helicone-session`        | Helicone session header injection            |
| `opencode-type-inject`             | Auto-inject TypeScript types into file reads |
| `opencode-dynamic-context-pruning` | Optimize token usage                         |
| `opencode-pty`                     | Run background processes in PTY              |
| `opencode-shell-strategy`          | Non-interactive shell instructions           |
| `opencode-notificator`             | Desktop notifications and sounds             |
| `opencode-supermemory`             | Persistent memory across sessions            |
| `opencode-morph-fast-apply`        | Fast code editing with Morph API             |

Browse all at [opencode.ai/docs/ecosystem](https://opencode.ai/docs/ecosystem).
