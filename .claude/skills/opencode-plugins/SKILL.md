---
name: opencode-plugins
description: How to create, configure, and use OpenCode plugins to extend functionality with event hooks, custom tools, environment injection, and compaction customization. Use when building OpenCode plugins, writing plugin hooks, adding custom tools via plugins, or debugging plugin behavior.
---

# OpenCode Plugins

Plugins extend OpenCode by hooking into events and customizing behavior. A plugin is a JavaScript/TypeScript module that exports one or more plugin functions. Each function receives a context object and returns a hooks object.

## Quick start

Create a minimal plugin:

```ts
// .opencode/plugins/my-plugin.ts
export const MyPlugin = async ({ project, client, $, directory, worktree }) => {
  console.log("Plugin initialized!");

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await client.app.log({
          body: {
            service: "my-plugin",
            level: "info",
            message: "Session completed",
          },
        });
      }
    },
  };
};
```

## Instructions

### Step 1: Choose plugin location

Plugins can be loaded from two sources:

**Local files** (auto-loaded at startup):

| Location                      | Scope                 |
| ----------------------------- | --------------------- |
| `.opencode/plugins/`          | Project-level plugins |
| `~/.config/opencode/plugins/` | Global plugins        |

**npm packages** (configured in `opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-wakatime", "@my-org/custom-plugin"]
}
```

### Step 2: Understand load order

Plugins load in this sequence:

1. Global config (`~/.config/opencode/opencode.json`)
2. Project config (`opencode.json`)
3. Global plugin directory (`~/.config/opencode/plugins/`)
4. Project plugin directory (`.opencode/plugins/`)

All hooks from all sources run in sequence. Duplicate npm packages (same name + version) load once; local and npm plugins with similar names both load.

### Step 3: Write the plugin structure

Every plugin exports an async function receiving a context object:

```ts
export const MyPlugin = async ({ project, client, $, directory, worktree }) => {
  // Initialization logic here

  return {
    // Hook implementations
  };
};
```

**Context object fields:**

| Field       | Description                            |
| ----------- | -------------------------------------- |
| `project`   | Current project information            |
| `directory` | Current working directory              |
| `worktree`  | Git worktree path                      |
| `client`    | OpenCode SDK client for AI interaction |
| `$`         | Bun's shell API for executing commands |

### Step 4: Add TypeScript types (recommended)

```ts
import type { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async ({
  project,
  client,
  $,
  directory,
  worktree,
}) => {
  return {
    // Type-safe hook implementations
  };
};
```

### Step 5: Implement event hooks

Subscribe to events by returning handler functions keyed by event name:

```ts
export const MyPlugin = async (ctx) => {
  return {
    // Generic event handler (receives all events)
    event: async ({ event }) => {
      console.log(event.type, event);
    },

    // Tool lifecycle hooks
    "tool.execute.before": async (input, output) => {
      // Modify or block tool execution
    },
    "tool.execute.after": async (input, output) => {
      // React to tool completion
    },

    // Shell environment hook
    "shell.env": async (input, output) => {
      output.env.MY_VAR = "value";
    },

    // Compaction hook (experimental)
    "experimental.session.compacting": async (input, output) => {
      output.context.push("## Custom context to persist");
    },
  };
};
```

### Step 6: Add external dependencies (if needed)

For local plugins that need npm packages, add a `package.json` in the config directory:

```json
// .opencode/package.json
{
  "dependencies": {
    "shescape": "^2.1.0"
  }
}
```

OpenCode runs `bun install` at startup. Then import in your plugin:

```ts
import { escape } from "shescape";

export const MyPlugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash") {
        output.args.command = escape(output.args.command);
      }
    },
  };
};
```

### Step 7: Add custom tools via plugins

Use the `tool()` helper from `@opencode-ai/plugin`:

```ts
import { type Plugin, tool } from "@opencode-ai/plugin";

export const CustomToolsPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      mytool: tool({
        description: "This is a custom tool",
        args: {
          foo: tool.schema.string(),
        },
        async execute(args, context) {
          const { directory, worktree } = context;
          return `Hello ${args.foo} from ${directory} (worktree: ${worktree})`;
        },
      }),
    },
  };
};
```

Plugin tools that share a name with built-in tools **take precedence** over the built-ins.

### Step 8: Use structured logging

Use `client.app.log()` instead of `console.log` for structured, leveled logging:

```ts
await client.app.log({
  body: {
    service: "my-plugin",
    level: "info", // debug | info | warn | error
    message: "Plugin initialized",
    extra: { foo: "bar" },
  },
});
```

## Examples

### Example 1: macOS notification on session completion

```js
// .opencode/plugins/notification.js
export const NotificationPlugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await $`osascript -e 'display notification "Session completed!" with title "opencode"'`;
      }
    },
  };
};
```

### Example 2: Protect .env files from being read

```js
// .opencode/plugins/env-protection.js
export const EnvProtection = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "read" && output.args.filePath.includes(".env")) {
        throw new Error("Do not read .env files");
      }
    },
  };
};
```

### Example 3: Inject environment variables into all shells

```js
// .opencode/plugins/inject-env.js
export const InjectEnvPlugin = async () => {
  return {
    "shell.env": async (input, output) => {
      output.env.MY_API_KEY = "secret";
      output.env.PROJECT_ROOT = input.cwd;
    },
  };
};
```

### Example 4: Custom compaction with injected context

```ts
import type { Plugin } from "@opencode-ai/plugin";

export const CompactionPlugin: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      output.context.push(`## Custom Context
Include any state that should persist across compaction:
- Current task status
- Important decisions made
- Files being actively worked on`);
    },
  };
};
```

### Example 5: Replace compaction prompt entirely

```ts
import type { Plugin } from "@opencode-ai/plugin";

export const CustomCompactionPlugin: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      output.prompt = `You are generating a continuation prompt.
Summarize:
1. The current task and its status
2. Which files are being modified
3. Any blockers or dependencies
4. The next steps to complete the work`;
    },
  };
};
```

When `output.prompt` is set, it completely replaces the default compaction prompt and `output.context` is ignored.

### Example 6: Multi-tool plugin with context

```ts
import { type Plugin, tool } from "@opencode-ai/plugin";

export const DevToolsPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      get_git_status: tool({
        description: "Get current git status summary",
        args: {},
        async execute(args, context) {
          const result = await Bun.$`git status --porcelain`
            .cwd(context.directory)
            .text();
          return result || "Working tree clean";
        },
      }),
      count_lines: tool({
        description: "Count lines in a file",
        args: {
          path: tool.schema.string().describe("File path to count lines in"),
        },
        async execute(args, context) {
          const result = await Bun.$`wc -l < ${args.path}`
            .cwd(context.directory)
            .text();
          return `${result.trim()} lines`;
        },
      }),
    },
  };
};
```

## Best practices

### Plugin design

- **Single responsibility** - One plugin per concern (notifications, security, env, etc.)
- **Fail gracefully** - Use try/catch in hooks; a thrown error in `tool.execute.before` blocks execution
- **Use structured logging** - Prefer `client.app.log()` over `console.log`
- **Type your plugins** - Import `Plugin` type from `@opencode-ai/plugin` for safety
- **Minimize side effects** - Don't modify global state outside of hook outputs

### Hook patterns

| Hook                              | Input              | Output                   | Use Case                    |
| --------------------------------- | ------------------ | ------------------------ | --------------------------- |
| `event`                           | `{ event }`        | —                        | React to any system event   |
| `tool.execute.before`             | `{ tool, args }`   | `{ args }`               | Modify/block tool calls     |
| `tool.execute.after`              | `{ tool, result }` | `{ result }`             | Post-process tool results   |
| `shell.env`                       | `{ cwd }`          | `{ env }`                | Inject env vars into shells |
| `experimental.session.compacting` | `{ session }`      | `{ context[], prompt? }` | Customize compaction        |

### Security considerations

- Use `tool.execute.before` to validate/sanitize dangerous operations
- Block sensitive file reads (`.env`, credentials, secrets)
- Sanitize shell commands before execution
- Don't hardcode secrets; use environment variables or secure vaults

### Common mistakes

- Forgetting to return the hooks object from the plugin function
- Using `console.log` instead of `client.app.log()` (logs get swallowed in TUI)
- Not handling async errors in hook functions
- Creating circular dependencies between plugins
- Overriding built-in tools unintentionally (use unique names)

## Requirements

### Runtime

- OpenCode with Bun runtime (plugins are executed with Bun)
- TypeScript support is built-in (no separate compilation needed)
- npm packages in `plugin` config array are auto-installed to `~/.cache/opencode/node_modules/`

### Plugin type definition

```ts
import type { Plugin } from "@opencode-ai/plugin";

// Plugin is: async (ctx: PluginContext) => HooksObject
```

### Available events reference

See [reference.md](reference.md) for the complete list of all subscribable events organized by category.

### Dependencies

- `@opencode-ai/plugin` - For TypeScript types and the `tool()` helper
- Bun shell API (`$`) - Available in context for command execution
- OpenCode SDK client - Available in context for programmatic AI interaction

## Troubleshooting

**Plugin doesn't load:**

- Verify file is in `.opencode/plugins/` or `~/.config/opencode/plugins/`
- Check that the export is a named async function (not default for plugins)
- Ensure the file extension is `.js`, `.ts`, `.mjs`, or `.mts`

**npm plugin not found:**

- Verify the package name in `opencode.json` `plugin` array
- Check `~/.cache/opencode/node_modules/` for the installed package
- Run OpenCode again to trigger auto-install

**Hook not firing:**

- Confirm the hook name matches exactly (e.g., `tool.execute.before` not `tool.before`)
- Verify the plugin function returns an object with the hook
- Check logs for plugin initialization errors

**Custom tool not appearing:**

- Ensure it's returned under the `tool` key in the hooks object
- Verify tool names don't accidentally collide with built-in tools
- Check that `tool()` helper is imported from `@opencode-ai/plugin`

## ⚠️ Known Pitfalls (learned in production)

### Self-import crash when building a plugin as an npm package

**Symptom:** `ResolveMessage: Cannot find package '<your-package-name>'` on OpenCode startup.

**Cause:** When developing a plugin *as a publishable npm package*, if you have a `.opencode/plugins/` file that imports from the package by name (e.g. `export { MyPlugin } from "my-plugin-package"`), OpenCode will try to resolve it at startup — but the package isn't installed in `node_modules` because you're building it, not consuming it.

**Fix:** Use a relative import in the local plugin file instead:

```ts
// ❌ Crashes — package not installed yet
export { MyPlugin } from "my-plugin-package";

// ✅ Works — relative import resolves directly
export { MyPlugin } from "../../src/index.js";
```

**Alternative:** Delete `.opencode/plugins/` entirely from the repo root while running `opencode run` to build the project. The agent doesn't need to load the plugin to build and test it — that folder is only for end users.

---

### OpenCode hangs at startup when `.opencode/plugins/` imports unbuilt TypeScript

**Symptom:** OpenCode starts (logs show plugin loading), then silently hangs with no LLM activity.

**Cause:** A plugin file imports from `../../src/index.js` but the `.js` file doesn't exist yet (TypeScript hasn't been compiled). Bun may hang trying to resolve the import.

**Fix:** Either:
1. Build the project first (`npm run build`) before running OpenCode in the same directory
2. Use `.ts` extension in the import: `export { MyPlugin } from "../../src/index.ts"` (Bun handles `.ts` directly)
3. Remove the `.opencode/plugins/` folder during the build/development session

---

### Stale OpenCode processes pile up

**Symptom:** OpenCode sessions become slow to start, high memory usage, LLM calls don't fire.

**Cause:** Each `opencode run` spawns a process. Timed-out or killed sessions may leave zombie processes running.

**Check and clean up:**

```bash
ps aux | grep opencode | grep -v grep
# Kill any PIDs from old sessions that are no longer needed
kill <pid1> <pid2> ...
```

---

### Agent notification: use direct messaging, not only system events

When a coding agent finishes a long task, always include a direct user notification — not just `openclaw system event`. The system event only wakes the orchestrator agent when it's triggered; the user won't get a push notification.

```bash
# ✅ Direct Telegram notification (user gets pinged immediately)
openclaw message send --target <user_telegram_id> --channel telegram \
  --message "✅ Done: [repo] pushed to main — ready for review"

# ⚠️ system event alone — only reaches orchestrator when session is triggered
openclaw system event --text "Done: ..." --mode now
```
