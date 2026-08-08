# Architectural Guidelines

This document outlines the architectural boundaries and structure of the `agy-headroom` plugin.

## Module Boundaries
- **Manifest-Driven**: The plugin's capabilities are registered and controlled exclusively via `plugin.yaml` and `plugin.json` at the root of the repository.
- **Loose Coupling**: Hook scripts must not import logic directly from command files, and vice versa. Each component should execute its operations independently.
- **CLI Delegation**: The plugin delegates the heavy lifting of context caching, retrieval, and statistics to the underlying `headroom` CLI binary rather than implementing its own caching engine.

## Lifecycle Hook Architecture
- **Hook Placement**: Node.js scripts handling hooks must live inside the [`scripts/`](file:///Users/chris/Development/agy-headroom/scripts) directory.
- **Standard Input/Output**: Hooks must strictly adhere to the Antigravity `hooks.json` contract:
  - Input: System JSON metadata supplied via `stdin`.
  - Output: Executable decision or injection JSON object returned on `stdout`.
- **Stateless Execution**: Hooks should remain stateless and execute synchronously.

## Slash Command Design
- **Configuration**: Expose slash commands as `.toml` config files in the [`commands/`](file:///Users/chris/Development/agy-headroom/commands) directory.
- **Prompt Injection**: Commands should provide clear descriptions and inject instruction templates that guide the agent's interaction loop rather than performing direct actions themselves.
