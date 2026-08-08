---
name: headroom
description: Manage the Headroom context optimization layer, inspect caching/savings, and control LLM context compression.
---

# Headroom Context Optimization Guide

This skill details instructions for managing and utilising Headroom, the Context Optimisation Layer for LLM applications.

## Overview
Headroom optimises the context window by caching and compressing large tool outputs (such as file listings and search results). When the agent needs details from a compressed output, it fetches the original content via the Headroom MCP server (`headroom_retrieve` tool) or proxy.

## Key Commands
- **Check Integration Health**: `headroom doctor`
- **View Savings Metrics**: `headroom savings`
- **List and Manage Cached Memories**: `headroom memory list` or `headroom memory stats`
- **Start the Proxy Server**: `headroom proxy`
- **Launch the Savings Dashboard**: `headroom dashboard`

## Operational Guidelines
1. **Always Verify Health**: Before executing intensive tasks, check that Headroom is functional by running `headroom doctor`.
2. **Context Compression**: If context usage is high, refer to `headroom savings` to check optimisation status.
3. **Retrieval**: Use the headroom retrieval tools when referencing compressed content hashes.
