# agy-headroom - Intent Specification

This document records the confirmed intent and scope for the `agy-headroom` Antigravity plugin.

- **Outcome**: A completely transparent Antigravity plugin (`agy-headroom`) that automatically launches the Headroom proxy in the background when `agy` starts, monitors context consumption, and prunes or compresses large tool outputs inline.
- **User**: Creative coder who wants to maximise token execution efficiency and minimise latency without disrupting their creative coding flow.
- **Why now**: Large context windows increase latency and token consumption, which interrupts creative focus; the current setup requires manual commands (`/headroom proxy`, `headroom doctor`) or manual troubleshooting.
- **Success**: The Headroom proxy runs automatically on `agy` startup, dynamically compresses context (such as file reads and search results), and automatically manages context usage without manual configuration or user prompts.
- **Constraint**: Must be completely transparent (no prompts, automatic background start, graceful port conflict or failure handling).
- **Out of scope**: Creating custom metrics or a web dashboard (instead leveraging Headroom's built-in dashboard) or manual pruning selection.
