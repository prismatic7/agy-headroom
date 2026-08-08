---
name: docs
description: Audit, update, and maintain comprehensive inline documentation and external markdown guides across the project.
---

# Documentation Workflow

This workflow instructs the agent to inspect the codebase for missing or outdated documentation.

## Execution Steps

1. **Scan Modules & Functions**:
   - Check all JavaScript files for exported functions.
   - Verify that each function has a descriptive JSDoc block detailing its parameters, return types, and side effects.
2. **Review Configuration Documentation**:
   - Check that all slash commands defined in [`commands/`](file:///Users/chris/Development/agy-headroom/commands) have clear description strings and documentation.
   - Verify that custom rules and skills contain clear usage guides.
3. **Audit README.md**:
   - Review [`README.md`](file:///Users/chris/Development/agy-headroom/README.md) for structural correctness.
   - If directory paths, manifests (`plugin.json`), or dependency requirements are modified, update the README to reflect changes.
4. **Generate Inline Annotations**:
   - Auto-generate JSDoc annotations for functions lacking documentation.
   - Ensure spelling is correct and matches Australian English standards.
