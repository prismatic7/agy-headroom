# Security Guardrails

This document defines security constraints and validation practices for the `agy-headroom` plugin.

## Shell Command Injection Prevention
- **No Unsafe Formatting**: Never format shell command arguments dynamically using raw string template literals (e.g. `sh -c "headroom ${userArgs}"`).
- **Use Parameter Arrays**: When spawning child processes or checking commands, execute binaries with parameters split as arrays (e.g. `spawnSync('headroom', ['doctor'])`).
- **Argument Sanitisation**: Slash commands that process `{{args}}` must ensure only alphanumeric and basic separator characters (e.g. spaces, hyphens) are executed. Reject arguments containing characters like `;`, `&`, `|`, `$`, `` ` ``, `>`, `<`, or newline sequences.

## Secrets and PII Safety
- **No Hardcoded API Tokens**: Credentials, authentication keys, and personal identifying information (PII) must never be committed to repository code or config files.
- **No Machine-Specific Paths**: Machine-specific paths (e.g. `/Users/chris`) must be avoided. Use standard relative paths, environment-variable expansion, or home directory expansion (`~/`).

## Network and Filesystem Boundaries
- **Local Scope**: Limit all network interactions to the local Headroom proxy (`127.0.0.1:8787`).
- **Workspace Isolation**: Scripts must operate only on directories within the active workspace path.
