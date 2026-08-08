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
