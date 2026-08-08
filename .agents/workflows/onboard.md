---
name: onboard
description: Walkthrough guide and instructions for onboarding new developers or agents to the agy-headroom codebase.
---

# Onboarding Workflow

Welcome to `agy-headroom`! This document guides you through the repository architecture, installation, and common patterns.

## Codebase Walkthrough

- **`plugin.json` & `plugin.yaml`**: The entry points for the Antigravity system. They register metadata, slash commands, skills, and hooks.
- **`commands/`**: Slash command TOML templates that translate user shortcuts into agent prompts.
- **`rules/`**: Markdown rule sets applied automatically when this plugin is enabled.
- **`skills/`**: Customized on-demand instructions guiding the agent through manual interactions with Headroom.
- **`scripts/`**: Lifecycle hook scripts (e.g. `headroom-hook.mjs` checking proxy status).
- **`tests/`**: Test suites verifying hook and command integration.

## Step-by-Step Local Setup

1. **Clone the repository**:
   Ensure you are working in your `~/Development` directory.
2. **Install Headroom CLI**:
   Verify that headroom is installed and available in your shell:
   `headroom --version`
3. **Run the Test Suite**:
   Confirm that all script tests pass:
   `node tests/headroom-hook.test.mjs`
4. **Register the Plugin**:
   Add the plugin to your global `~/.gemini/config/config.json` configuration or via workspace `plugins.json` entry.

## Common Pitfalls and Gotchas
- **Hardcoded Pathing**: Never commit absolute local paths (e.g. `/Users/chris`). Use relative references or environment variable fallbacks (like `process.env.HEADROOM_PORT`).
- **Proxy Port Configuration**: Headroom proxy defaults to port `8787`. If you run custom ports, ensure `HEADROOM_PORT` environment variable is exported correctly.
- **Exit Codes**: The lifecycle hook runner monitors script exit codes. If a script fails, it should log a clear message and exit cleanly unless execution must be blocked.
