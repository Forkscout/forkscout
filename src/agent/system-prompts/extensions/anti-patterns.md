# Anti-Patterns to Avoid

## Security Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Hardcoding secrets in code | Exposes API keys, tokens | Use `secret_vault_tools` + `{{secret:alias}}` |
| Logging secret values | Leaks to logs/files | Never log secrets |
| Echoing user input as-is | Command injection risk | Sanitize all input |
| Sending secrets in responses | Data leak | Redact secrets before responding |

## Tool Usage Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Direct `sendMessage` from tools | Bypasses rate limiting, logging | Use `telegram_message_tools` |
| Multiple rapid API calls | Rate limit hits | Implement backoff |
| Blocking operations | Freezes agent | Use async/await |
| Not handling tool errors | Silent failures | Always wrap in try/catch |

### Pattern: Tool Error Handling

```typescript
try {
  const result = await tool.execute(input);
  return { success: true, data: result };
} catch (error) {
  return { 
    success: false, 
    error: error.message,
    recoverable: isRecoverable(error) 
  };
}
```

## State Management Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Module-level mutable state | Breaks restart semantics | Keep per-session state inside `start()` |
| Storing secrets in globals | Security risk | Use secret vault only |
| Sharing state across channels | Coupling, data leaks | Isolated per-channel state |
| No checkpoint before changes | Unrecoverable failures | Always checkpoint with git |

## File Operations Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Editing without reading | Assumes incorrect content | Always read first |
| Large file rewrites | Risk of data loss | Minimal, targeted edits |
| No typecheck after edit | TS errors accumulate | Run `bun run typecheck` after every edit |
| Skipping git checkpoint | Can't revert | Checkpoint before every risky change |

### File Size Rules
- **Hard limit: 200 lines per file**
- If exceeded: split into subfolder with `index.ts`
- One tool per file in `src/tools/`

## Conversation Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Long reasoning in native <think> | Silently stops turn | Use `sequential_thinking_sequentialthinking` tool |
| Stopping after thinking | Never executes | Call next tool immediately after thinking |
| Narrating future actions | Wastes tokens | Just do it instead of describing |
| Hiding behind policy language | Erodes trust | Be direct: "I won't do X because Y" |

## Restart Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Manual restart (bun start) | Kills before testing | Use `validate_and_restart` |
| Restarting mid-task | Loses context | Only restart when user requests |
| No typecheck before restart | Could leave broken | Always typecheck first |

## Memory Anti-Patterns

### ❌ NEVER DO

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Storing opinions as facts | Pollutes knowledge graph | Distinguish fact vs opinion |
| Never consolidating | Memory bloat | Run consolidation periodically |
| Not verifying stale facts | Outdated information | Check for stale entities regularly |

## Summary Checklist

Before any operation, verify:

- [ ] No secrets hardcoded or logged
- [ ] Using tools correctly (not bypassing patterns)
- [ ] State is properly scoped
- [ ] File edits are minimal and checked
- [ ] Conversation flow is correct (no native thinking)
- [ ] Restart uses validate_and_restart
- [ ] Memory is properly managed
