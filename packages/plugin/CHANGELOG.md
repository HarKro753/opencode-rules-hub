# Changelog

All notable changes to the `opencode-rules-hub` plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-23

### Added
- Initial release
- Connects to a self-hosted opencode-rules-hub server
- Fetches configured rule sets and injects them into OpenCode agent context via `experimental.session.compacting`
- Persists rules locally to `.opencode/rules-local.md` with infinite TTL
- `/rules-sync` tool — force re-fetch rules from the server
- `/rules` tool — display currently cached rules
- Falls back to local cache if server is unreachable
- Reads project config from `.opencode/rules.json`
