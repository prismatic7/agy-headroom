# agy-headroom

An Antigravity plugin that integrates the Headroom Context Optimisation Layer to manage, inspect, and verify context compression and token savings for the Google Antigravity CLI (`agy`).

## Purpose

Large context windows often lead to increased latency, token consumption, and cognitive load on LLM agents. Headroom resolves this by caching and compressing large tool outputs. This plugin exposes Headroom management tools, status tracking, and a dedicated skill to the Antigravity environment.

## Architecture and Components

The plugin is structured as follows:

```text
agy-headroom/
├── plugin.json       # Manifest containing metadata
├── plugin.yaml       # Antigravity manifest registering capabilities
├── README.md         # Documentation and planning spec
└── skills/
    └── headroom/
        └── SKILL.md  # Core skill for guiding context optimization
```

### Registered Skills

- **`headroom`**: Guides the agent to check the health of Headroom (`headroom doctor`), verify savings (`headroom savings`), manage the local database (`headroom memory`), and start the proxy.

## Development Lifecycle

This plugin is developed using the `plugin-development` skill guidelines:
1. **Planning**: Defined in this document.
2. **Scaffolding**: Created basic manifests and directory structure.
3. **Security Review**: Ensure commands run cleanly without shell injection vectors.
4. **Documentation**: Detailed in this file.
