---
name: 🔧 New Tool
about: Propose or implement a new agent tool
title: "[Tool] "
labels: tool, enhancement
assignees: ''
---

## Tool Name

e.g., `screenshot_page`, `generate_chart`, `translate_text`

## What It Does

Brief description of the tool's purpose and when the agent would use it.

## Parameters

```typescript
{
    url: z.string().describe("URL to screenshot"),
    width: z.number().optional().describe("Viewport width"),
}
```

## Return Value

What the tool returns to the agent (text, file path, structured data).

## Dependencies

Any npm packages needed? External APIs?

## Security

- [ ] This tool is safe for all users
- [ ] This tool should be owner-only (`ownerOnlyTools`)
- [ ] This tool needs vault secrets

## Checklist

- [ ] I've read [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] I'd like to implement this myself
- [ ] I've checked there's no existing tool that does this
