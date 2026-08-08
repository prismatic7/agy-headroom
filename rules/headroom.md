# Headroom Context Optimisation Rule

When the `agy-headroom` plugin is active, the agent must adhere to the following guidelines:

1. **Verify Headroom Health**: Prior to executing large filesystem reads, complex search queries, or multi-step code refactoring tasks, execute `headroom doctor` to verify that the context optimisation proxy is active and routing correctly.
2. **Utilise Retrieve Tool**: When encountering cached or compressed text markers (such as hashes) within command or tool outputs, retrieve the full content using the `headroom_retrieve` tool. Do not guess or extrapolate content.
3. **Monitor Savings**: Periodically check token compression and cost reduction by running `headroom savings` to ensure context usage remains within optimal bounds.
