---
name: memory-management
description: The workspace file system that defines an agent's identity, personality, user knowledge, and persistent memory. Use when setting up agent identity, configuring bootstrap files, or implementing persistent memory systems.
---

# Memory Management

An agent's identity and knowledge are stored in simple markdown files within a workspace directory. These files are loaded at startup and injected into every conversation, giving the agent its "self."

## Quick start

Minimal workspace structure:

```
workspace/
  AGENT.md          # Behavioral rules
  memory/
    MEMORY.md       # Learned facts
```

Example AGENT.md:

```markdown
# Agent Instructions

Be helpful, concise, and accurate.
Use tools to perform actions.
Remember important information in memory/MEMORY.md.
```

Example MEMORY.md:

```markdown
# Long-term Memory

## User Preferences

- Prefers concise responses
- Uses Python for coding
```

## Instructions

### Step 1: Create the workspace directory

```bash
mkdir -p workspace/memory
```

### Step 2: Create bootstrap files (optional but recommended)

| File        | Purpose            | Example Content             |
| ----------- | ------------------ | --------------------------- |
| SOUL.md     | Personality traits | "Helpful, curious, honest"  |
| IDENTITY.md | Who the agent is   | Name, purpose, capabilities |
| USER.md     | User information   | Preferences, goals, context |
| AGENT.md    | Behavioral rules   | Guidelines and constraints  |

### Step 3: Create the memory directory

```bash
mkdir -p workspace/memory
touch workspace/memory/MEMORY.md
```

### Step 4: Set up daily notes (optional)

```bash
# Daily notes go in YYYYMM/YYYYMMDD.md
mkdir -p workspace/memory/202602
touch workspace/memory/202602/20260215.md
```

### Step 5: Configure memory paths in system prompt

```markdown
## Memory

- Long-term: /workspace/memory/MEMORY.md
- Daily notes: /workspace/memory/YYYYMM/YYYYMMDD.md
```

## Examples

### Example 1: SOUL.md (Personality)

```markdown
# Soul

## Personality

- Helpful and friendly
- Concise and to the point
- Curious and eager to learn
- Honest and transparent

## Values

- Accuracy over speed
- User privacy and safety
- Transparency in actions
```

### Example 2: IDENTITY.md (Self)

```markdown
# Identity

## Name

Assistant

## Purpose

Personal AI assistant for coding and research

## Capabilities

- File operations
- Web search
- Shell commands
- Multi-channel messaging
```

### Example 3: USER.md (User knowledge)

```markdown
# User

## Preferences

- Communication style: casual
- Timezone: UTC+8
- Language: English

## Context

- Working on a Go project
- Deploying to AWS Lambda
- Prefers detailed explanations
```

### Example 4: MEMORY.md (Learned facts)

```markdown
# Long-term Memory

## Project Information

- Main language: Go
- Database: PostgreSQL
- Deployment: Kubernetes

## User Preferences

- Always explain code changes
- Run tests before committing
- Use conventional commits
```

### Example 5: Daily note (Episodic memory)

```markdown
# 2026-02-15

## 10:30 - Helped debug authentication

Found JWT token was expiring too quickly. Increased to 24h.

## 14:00 - Updated deployment config

Changed Lambda memory from 512MB to 1024MB per user request.
```

## Best practices

### File organization

- **One file, one purpose**: SOUL = personality, IDENTITY = self, USER = human, AGENT = rules
- **Keep files focused**: If MEMORY.md grows too large, summarize or archive
- **Use daily notes for episodic memory**: What happened, when, outcome

### Content guidelines

- **Plain text only**: No databases, no binary formats
- **Human-readable**: Anyone can read and edit with a text editor
- **Version controlled**: Put workspace in git for history

### Memory hygiene

- **Be selective**: Store important facts, not conversation logs
- **Update regularly**: Remove outdated information
- **Categorize**: Use headers to organize (## User, ## Project, ## Preferences)

### Loading order

Bootstrap files load in this order:

1. AGENT.md
2. SOUL.md
3. USER.md
4. IDENTITY.md

Later files can reference concepts from earlier ones.

### Anti-patterns

- **Overloading MEMORY.md**: Keep it focused, not a conversation dump
- **Conflicting files**: Don't put personality in AGENT.md or rules in SOUL.md
- **Huge files**: Split or summarize if over 500 lines
- **Sensitive data**: Never store passwords or API keys

## Requirements

### Directory structure

```
workspace/
  SOUL.md           # Optional: personality
  IDENTITY.md       # Optional: agent identity
  USER.md           # Optional: user information
  AGENT.md          # Optional: behavioral rules
  memory/
    MEMORY.md       # Required: long-term memory
    YYYYMM/         # Optional: daily notes
      YYYYMMDD.md
```

### File format

- Markdown (.md) files only
- YAML frontmatter optional
- UTF-8 encoding
- Unix line endings preferred

### Context loading

Recent daily notes (last 3 days) are loaded into context. Older notes remain on disk for explicit retrieval.

### Permissions

- Agent can read all bootstrap files
- Agent can write to MEMORY.md and daily notes
- Agent should ask before modifying SOUL.md or IDENTITY.md
