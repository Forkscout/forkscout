# Contributing to ForkScout

Thanks for your interest in contributing to ForkScout! This guide will help you get started.

## Quick Start

```bash
git clone https://github.com/Forkscout/forkscout.git
cd forkscout-agent
bun install
bun run setup    # interactive setup wizard
bun run dev      # start with hot reload
```

**Requirements:** [Bun](https://bun.sh) v1.0+

## Project Structure

```
src/
├── agent/          # LLM runner, system prompts
├── channels/       # 20 communication channels (telegram, discord, slack, etc.)
├── providers/      # LLM provider registry (20 providers)
├── tools/          # Auto-discovered agent tools
├── mcp-servers/    # Auto-discovered MCP server configs
├── secrets/        # Vault encryption (AES-256-GCM)
├── setup/          # Interactive setup wizard
├── logs/           # Structured logging
├── llm/            # Summarization pipeline
└── utils/          # Shared utilities
```

## Code Rules

| Rule | Detail |
|---|---|
| **Language** | TypeScript strict mode — no `any` |
| **Max file size** | 200 lines. Refactor if exceeded. |
| **Runtime** | Bun (not Node.js) |
| **Styling** | Tailwind CSS (frontend) |
| **Components** | Use folder architecture for complex components |
| **Imports** | Use `@/` path alias (maps to `src/`) |
| **Typecheck** | Run `bun run typecheck` after every change |

## Adding a New Tool

Drop a `.ts` file in `src/tools/`. It's auto-discovered on restart. No registration needed.

```typescript
// src/tools/my_tool.ts
import { z } from "zod";

export const my_tool = {
    description: "What this tool does",
    parameters: z.object({
        input: z.string().describe("What this parameter is"),
    }),
    execute: async (args: { input: string }) => {
        return `Result: ${args.input}`;
    },
};
```

## Adding a New Channel

Create `src/channels/<name>/index.ts` implementing the `Channel` interface (~60 lines):

```typescript
import type { Channel } from "@/channels/types.ts";

const myChannel: Channel = {
    name: "mychannel",
    start: async (config) => { /* connect and listen */ },
    getRole: (userId) => { /* return "owner" | "user" | "denied" */ },
    sendReply: async (chatId, text) => { /* send message */ },
};

export default myChannel;
```

Register it in `src/index.ts` under `autoChannels`.

## Adding an MCP Server

Drop a `.json` file in `src/mcp-servers/`:

```json
{
    "enabled": true,
    "type": "sse",
    "url": "http://localhost:PORT/mcp"
}
```

Set `"enabled": false` to disable without deleting.

## PR Workflow

1. **Fork** the repo
2. **Branch** from `main`: `git checkout -b feat/my-feature`
3. **Code** — keep files under 200 lines
4. **Typecheck**: `bun run typecheck` (must pass)
5. **Commit** using conventional format:
   - `feat: add LINE channel support`
   - `fix: resolve vault key derivation bug`
   - `refactor: split dashboard into components`
   - `docs: update README with voice channel setup`
6. **Push** and open a PR against `main`
7. **Describe** what changed and why in the PR description

## Commit Format

```
type: short description

Longer explanation if needed.
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

## What to Work On

- Check [issues labeled `good first issue`](https://github.com/Forkscout/forkscout/labels/good%20first%20issue)
- Check [issues labeled `help wanted`](https://github.com/Forkscout/forkscout/labels/help%20wanted)
- Propose new features via GitHub Issues

## Security

- **Never** commit `.env`, `vault.enc.json`, or `auth.json`
- **Never** hardcode API keys or secrets
- All secrets go through the encrypted vault (`src/secrets/vault.ts`)
- Use `{{secret:ALIAS}}` placeholders — never raw values

## Review Timeline

PRs are reviewed within **48 hours**. If your PR is blocked, comment and we'll prioritize.

## Questions?

- Open a [GitHub Discussion](https://github.com/Forkscout/forkscout/discussions)
- Join the [Discord](https://discord.gg/forkscout)

---

**Thank you for contributing to ForkScout!** Every PR, issue, and suggestion helps make autonomous AI agents better for everyone. ⑂
