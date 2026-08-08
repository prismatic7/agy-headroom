# GEMINI.md - agy-headroom Master Guide

## Project Overview
`agy-headroom` is a Google Antigravity plugin designed to integrate the Headroom Context Optimisation Layer. It optimizes context window usage, token overhead, and costs by managing and verifying context compression, caching, and retrieval.

## Tech Stack
- **Runtime**: Node.js 18+ (ES Modules)
- **Plugin Host**: Google Antigravity CLI (`agy`)
- **CLI Commands**: Headroom CLI (`headroom` binary)
- **Languages**: JavaScript (Node.js shell integrations, tests), YAML/JSON (metadata), TOML (commands)

## Architecture & Directory Map
- **[`commands/`](file:///Users/chris/Development/agy-headroom/commands)**: Contains TOML files defining slash commands exported to the Antigravity CLI.
- **[`rules/`](file:///Users/chris/Development/agy-headroom/rules)**: Contains Markdown files detailing rules applied when the plugin is active.
- **[`skills/`](file:///Users/chris/Development/agy-headroom/skills)**: Contains on-demand custom skills (`SKILL.md` files) for managing Headroom.
- **[`scripts/`](file:///Users/chris/Development/agy-headroom/scripts)**: Executable Node.js scripts for lifecycle hooks.
- **[`tests/`](file:///Users/chris/Development/agy-headroom/tests)**: Test suites verifying hook scripts and integration logic.
- **[`mcp_config.json`](file:///Users/chris/Development/agy-headroom/mcp_config.json)**: Declares the Headroom MCP server.
- **[`hooks.json`](file:///Users/chris/Development/agy-headroom/hooks.json)**: Maps lifecycle events to hook scripts.

## Development Commands
- **Run Hook Tests**: `node tests/headroom-hook.test.mjs`
- **Verify Git Status**: `git status`

## Coding Conventions
- **Language**: JavaScript (ES Modules, strict mode).
- **Spelling**: Australian English (e.g., optimisation, caching, utilising).
- **Style**: Direct, minimal, and YAGNI-compliant (You Aren't Gonna Need It).

## Critical Rules
- **No Machine-Specific Paths**: Never commit absolute home paths like `/Users/chris` to the repository. Use relative paths or environment variables (e.g. `HEADROOM_PORT`).
- **Validate Execution**: Always run test suites and verify exit codes before completing tasks.
