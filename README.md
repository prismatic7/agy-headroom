# agy-headroom

An Antigravity plugin that integrates the Headroom Context Optimisation Layer to manage, inspect, and verify context compression and token savings for the Google Antigravity CLI (`agy`).

## Purpose

Large context windows often lead to increased latency, token consumption, and cognitive load on LLM agents. Headroom resolves this by caching and compressing large tool outputs. This plugin exposes Headroom management tools, status tracking, hooks, and a dedicated skill to the Antigravity environment.

## Architecture and Components

The plugin is structured as follows:

```text
agy-headroom/
├── hooks.json            # Hook definitions registering PreInvocation events
├── mcp_config.json       # MCP server configuration
├── plugin.json          # Manifest containing metadata
├── plugin.yaml          # Antigravity manifest registering capabilities
├── README.md            # Plugin documentation and architecture spec
├── scripts/
│   └── headroom-hook.mjs # PreInvocation hook script for transparent lifecycle management
├── skills/
│   └── headroom/
│       └── SKILL.md     # Core skill for guiding context optimisation
└── tests/
    ├── headroom-hook.test.mjs # Unit verification tests for hook execution
    └── mock-server.mjs        # Deterministic mock server for test isolation
```

### Registered Skills

- **`headroom`**: Guides the agent to check the health of Headroom (`headroom doctor`), verify savings (`headroom savings`), manage the local database (`headroom memory`), and start the proxy daemon.

### Registered Hooks

- **`PreInvocation`**: Invokes `scripts/headroom-hook.mjs` prior to every agent invocation turn to manage proxy health and guarantee continuous context compression.

## Transparent Proxy Lifecycle Management

The `agy-headroom` plugin automatically manages the execution lifecycle of the Headroom proxy daemon to ensure seamless context compression without requiring manual intervention from the user.

### Auto-Start Mechanism

Before each agent invocation, the `PreInvocation` hook (`scripts/headroom-hook.mjs`) performs an automated health check against the configured proxy HTTP endpoint (`http://127.0.0.1:<HEADROOM_PORT>/stats`):

1. **Active Proxy Detection**: If the endpoint responds with HTTP status `200 OK`, the proxy is active, and the hook completes immediately with a clean, empty payload (`{ "injectSteps": [] }`).
2. **Transparent Auto-Start**: If the health check fails, the hook automatically spawns the `headroom proxy --port <HEADROOM_PORT>` process in detached mode (`detached: true`, `unref()`), allowing the proxy daemon to persist independently beyond the hook execution lifecycle.
3. **Health Verification**: The hook polls the proxy `/stats` endpoint every 100 milliseconds for up to 1.5 seconds (15 attempts). Once verified, the hook returns cleanly.
4. **Graceful Fallback**: If the proxy fails to start or respond within 1.5 seconds, the hook emits a warning to `stderr` and injects an ephemeral notification payload (`⚠️ [Headroom Warning]: Failed to start the Headroom context optimisation proxy. Context compression is disabled for this turn.`). The invocation turn proceeds safely without blocking.

## Configuration and Settings

The proxy lifecycle management script can be configured using environment variables:

| Environment Variable | Description | Default Value | Valid Range |
| :--- | :--- | :--- | :--- |
| `HEADROOM_PORT` | HTTP port on which the Headroom proxy daemon listens for stats and compression requests. | `8787` | `1`–`65535` |

### Setting Custom Ports

To configure a custom port for the Headroom proxy, export `HEADROOM_PORT` in your shell environment or set it in your agent execution configuration:

```bash
export HEADROOM_PORT=9090
```

If an invalid or out-of-range port number is supplied to `HEADROOM_PORT`, the hook script exits with a non-zero exit code and logs an explicit validation error to `stderr`.

## Testing and Verification

The repository includes a comprehensive unit verification suite to test the hook script under active, inactive, and invalid port configurations.

To execute the test suite:

```bash
node tests/headroom-hook.test.mjs
```

The test runner utilises a deterministic mock HTTP server (`tests/mock-server.mjs`) to verify:
- Clean payload returned when an active proxy is detected.
- Warning payload and `stderr` output when an inactive proxy fails auto-start.
- Exit error handling when an out-of-range port is provided.

## Development Lifecycle

This plugin is developed using the `plugin-development` skill guidelines:
1. **Planning**: Architecture and lifecycle management documented in this specification.
2. **Scaffolding**: Created manifests, hook definitions, and helper scripts.
3. **Security Review**: Ensures process spawning occurs safely with sanitized arguments and non-blocking background execution.
4. **Documentation**: Detailed in this document.
