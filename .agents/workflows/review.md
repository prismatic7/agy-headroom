---
name: review
description: Run a comprehensive code review on the plugin files to detect bugs, style violations, security issues, and test coverage gaps.
---

# Code Review Workflow

This workflow instructs the agent to audit the changeset of the plugin repository.

## Execution Steps

1. **Identify Changes**: Run `git diff` and `git status` to identify modified and staged files.
2. **Audit Logic and Error Handling**:
   - Check JavaScript files for proper handling of asynchronous calls, timeouts, and promise rejections.
   - Verify that process spawns handle errors and non-zero exit codes.
3. **Verify Security Guidelines**:
   - Ensure no hardcoded paths (e.g. `/Users/chris`) or credentials exist.
   - Check child process calls for parameter array usage to prevent injection.
4. **Style Alignment**:
   - Check formatting rules against [format.md](file:///Users/chris/Development/agy-headroom/.agents/rules/format.md).
   - Ensure spelling adheres to Australian English standards.
5. **Coverage Verification**:
   - Check if any new functionality has corresponding test assertions in the [tests/](file:///Users/chris/Development/agy-headroom/tests) directory.
6. **Structured Summary Output**:
   Present review findings in a structured table or checklist categorised by:
   - **Critical**: Must fix before committing.
   - **Warning**: Potential issues, code improvements, or minor style deviations.
   - **Info**: Stylistic remarks or general observations.
