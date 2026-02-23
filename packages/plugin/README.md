# opencode-rules-hub

**OpenCode plugin for centralized rules management.**

[![npm version](https://img.shields.io/npm/v/opencode-rules-hub?color=blue)](https://www.npmjs.com/package/opencode-rules-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This plugin connects your [OpenCode](https://opencode.ai) agent to a self-hosted rules server. Define your coding conventions once, share them across every project automatically.

## Installation

Add the plugin to your project's `opencode.json`:

```json
{
  "plugin": ["opencode-rules-hub"]
}
```

## Configuration

Create a config file in your repo:

```json
// .opencode/rules.json
{
  "server": "http://localhost:3847",
  "apiKey": "your-api-key",
  "sets": ["typescript", "company-conventions"]
}
```

On session compaction, the plugin fetches your rule sets, saves them to `.opencode/rules-local.md`, and injects them into the agent's context. Rules only refetch when you run `/rules-sync`.

## Commands

| Command       | Description                                  |
| ------------- | -------------------------------------------- |
| `/rules-sync` | Force re-fetch all rule sets from the server |
| `/rules`      | Display the current locally cached rules     |

## How It Works

1. The plugin reads `.opencode/rules.json` from your project root.
2. On compaction, it fetches the configured rule sets from the server.
3. Rules are cached locally in `.opencode/rules-local.md`.
4. The cached rules are injected into the agent context automatically.
5. Use `/rules-sync` to force a refresh at any time.

## Server Setup

This plugin requires a running `opencode-rules-hub` server. See the [main repository](https://github.com/HarKro753/opencode-rules-hub) for server setup instructions.

## License

MIT — see [LICENSE](./LICENSE).
