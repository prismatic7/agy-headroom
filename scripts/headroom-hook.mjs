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
    let resolved = false;

    const safeResolve = (value) => {
      if (!resolved) {
        resolved = true;
        resolve(value);
      }
    };

    // Spawn the proxy in detached mode so it survives hook exit
    const child = spawn('headroom', ['proxy', '--port', port.toString()], {
      detached: true,
      stdio: 'ignore'
    });

    child.on('error', (err) => {
      console.error(`⚠️ [Headroom Warning]: Failed to spawn Headroom proxy process: ${err.message}`);
      safeResolve(false);
    });

    try {
      child.unref();
    } catch {
      // Ignore if unref fails when spawn error occurs synchronously
    }

    // Poll stats endpoint to verify startup using recursive setTimeout
    let attempts = 0;
    const maxAttempts = 15; // 1.5 seconds maximum timeout

    const poll = async () => {
      if (resolved) return;

      attempts++;
      const isRunning = await checkHeadroom(port);

      if (resolved) return;

      if (isRunning) {
        return safeResolve(true);
      }

      if (attempts >= maxAttempts) {
        return safeResolve(false);
      }

      setTimeout(poll, 100);
    };

    setTimeout(poll, 100);
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
      console.error("⚠️ [Headroom Warning]: Failed to start the Headroom context optimisation proxy. Context compression is disabled for this turn.");
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
