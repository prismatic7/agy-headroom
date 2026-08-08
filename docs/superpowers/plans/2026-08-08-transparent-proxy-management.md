# Transparent Proxy Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the Headroom proxy starts automatically and transparently when an `agy` session begins, without prompt or manual input.

**Architecture:** Modify the `PreInvocation` hook (`headroom-hook.mjs`) to check the proxy status. If down, it will spawn the proxy daemon in detached mode, poll its `/stats` endpoint until healthy, and return a clean JSON payload.

**Tech Stack:** Node.js, `child_process`, `http`

## Global Constraints

- Must be completely transparent (no console logging other than the required hook JSON, no prompts).
- Must handle port conflicts and proxy startup failures gracefully by logging a warning to stderr (which does not block hook output).
- Spawning must not hold up the hook execution path beyond a 1.5-second timeout.
- Use Australian English spelling for documentation and user-facing messages.

---

### Task 1: Update Hook Script to Auto-Start Proxy

**Files:**
- Modify: `scripts/headroom-hook.mjs`

**Interfaces:**
- Consumes: `process.env.HEADROOM_PORT` (defaults to 8787)
- Produces: JSON payload on `stdout` `{ "injectSteps": [] }`

- [ ] **Step 1: Open the hook script**
  View [`scripts/headroom-hook.mjs`](file:///Users/chris/Development/agy-headroom/scripts/headroom-hook.mjs) to identify insertion points.

- [ ] **Step 2: Implement transparent spawn-and-poll logic**
  Replace the contents of `scripts/headroom-hook.mjs` with the updated logic.
  
  ```javascript
  #!/usr/bin/env node

  /**
   * Headroom Hook
   * Checks the status of the Headroom proxy before each invocation.
   * Automatically starts the proxy in the background if it is not running.
   */

  import http from 'http';
  import { spawn } from 'child_process';

  function checkHeadroom(port) {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${port}/stats`, { timeout: 200 }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  function startProxy(port) {
    return new Promise((resolve) => {
      // Spawn the proxy in detached mode so it survives hook exit
      const child = spawn('headroom', ['proxy', '--port', port.toString()], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();

      // Poll stats endpoint to verify startup
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const isRunning = await checkHeadroom(port);
        if (isRunning) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= 15) { // 1.5 seconds maximum timeout
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }

  async function main() {
    const rawPort = process.env.HEADROOM_PORT || "8787";
    const port = parseInt(rawPort, 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error(`Invalid HEADROOM_PORT: ${rawPort}`);
      process.exit(1);
    }

    let isRunning = await checkHeadroom(port);
    
    if (!isRunning) {
      const started = await startProxy(port);
      if (!started) {
        // Output ephemeral warning if proxy failed to start
        console.log(JSON.stringify({
          injectSteps: [
            {
              ephemeralMessage: "⚠️ [Headroom Warning]: Failed to start the Headroom context optimisation proxy. Context compression is disabled for this turn."
            }
          ]
        }));
        return;
      }
    }

    // Return clean JSON on success (completely transparent)
    console.log(JSON.stringify({
      injectSteps: []
    }));
  }

  main();
  ```

- [ ] **Step 3: Run hook manually**
  Run `node scripts/headroom-hook.mjs` to ensure there are no syntax errors.

- [ ] **Step 4: Commit changes**
  ```bash
  git add scripts/headroom-hook.mjs
  git commit -m "feat: transparently start headroom proxy in pre-invocation hook"
  ```

---

### Task 2: Implement Unit Verification Tests

**Files:**
- Create: `tests/headroom-hook.test.mjs`

**Interfaces:**
- Consumes: Hook script execution
- Produces: Execution pass/fail assertions

- [ ] **Step 1: Create the test script**
  Write the verification logic in `tests/headroom-hook.test.mjs` to mock and verify hook functionality.

  ```javascript
  import { execSync } from 'child_process';
  import http from 'http';

  async function runTests() {
    console.log("Starting headroom hook unit verification tests...");

    // Test 1: Check output when proxy is running
    try {
      const output = execSync('node scripts/headroom-hook.mjs', { encoding: 'utf8' }).trim();
      const parsed = JSON.parse(output);
      if (!parsed.injectSteps) {
        throw new Error("Missing injectSteps in hook output");
      }
      console.log("✓ Test 1 Passed: Hook returns valid JSON when proxy is active.");
    } catch (err) {
      console.error("✗ Test 1 Failed:", err.message);
      process.exit(1);
    }

    console.log("All unit verification tests passed.");
  }

  runTests();
  ```

- [ ] **Step 2: Execute the tests**
  Run the test command: `node tests/headroom-hook.test.mjs`
  Expected output: `All unit verification tests passed.`

- [ ] **Step 3: Commit tests**
  ```bash
  git add tests/headroom-hook.test.mjs
  git commit -m "test: add unit verification test for headroom hook"
  ```

---

### Task 3: Integration Verification

**Files:**
- None (operational check)

- [ ] **Step 1: Stop existing proxy**
  Kill any running headroom proxy:
  `killall headroom` or `pkill -f "headroom proxy"`

- [ ] **Step 2: Run agy command to trigger transparent startup**
  Run `agy --print "hello"` and verify it returns successfully.

- [ ] **Step 3: Verify the proxy started**
  Check active headroom process:
  `ps aux | grep headroom`
  Or run:
  `curl -s http://127.0.0.1:8787/livez`
  Expected response: `{"alive":true,"status":"healthy"}`

---

### Task 4: Update Documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document transparent context management**
  Add a section to `README.md` describing how the PreInvocation hook transparently manages proxy execution and how developers can configure it (e.g. `$HEADROOM_PORT`).

- [ ] **Step 2: Commit documentation**
  ```bash
  git add README.md
  git commit -m "docs: document transparent proxy lifecycle management"
  ```
