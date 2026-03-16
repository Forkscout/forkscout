# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in ForkScout, **please do NOT open a public issue.**

Instead, report it privately:

- **Email**: security@forkscout.com
- **GitHub**: Use [Security Advisories](https://github.com/Forkscout/forkscout/security/advisories/new)

We will acknowledge your report within **48 hours** and aim to release a fix within **7 days** for critical issues.

## Scope

The following are in scope for security reports:

- Vault encryption bypass or key leakage
- Secret values leaking into LLM context, logs, or tool outputs
- Authentication bypass (role escalation, access control issues)
- Remote code execution via crafted messages
- Path traversal in file read/write tools
- Prompt injection leading to unauthorized tool execution

## Security Architecture

ForkScout uses the following security measures:

| Layer | Protection |
|---|---|
| **Secrets** | AES-256-GCM encrypted vault (`vault.enc.json`) |
| **Agent isolation** | Secrets referenced by `{{secret:alias}}` — values never in LLM context |
| **Output censoring** | `censorSecrets()` scrubs leaked values from tool results |
| **Access control** | Three-tier roles: owner / user / denied |
| **Tool restriction** | `ownerOnlyTools` blocks dangerous tools for non-owners |
| **Rate limiting** | Per-user rate limits on all channels |
| **Input validation** | `maxInputLength` caps on all channels |

## Best Practices for Operators

1. **Never** commit `.env`, `vault.enc.json`, or `auth.json`
2. Set `ownerUserIds` in production — do not run in dev mode
3. Keep `ownerOnlyTools` configured for `run_shell_commands` and `write_file`
4. Run `forkscout setup` to migrate any plaintext secrets to the vault
5. Regularly rotate your `VAULT_KEY` and API keys

## Supported Versions

| Version | Supported |
|---|---|
| 3.x | ✅ Active |
| < 3.0 | ❌ No longer supported |
