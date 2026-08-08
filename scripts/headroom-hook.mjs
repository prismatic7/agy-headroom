#!/usr/bin/env node

/**
 * Headroom Hook
 * Checks the status of the Headroom proxy before each invocation.
 * Injects a warning message if the proxy is not running.
 */

import http from 'http';

function checkHeadroom(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/stats`, { timeout: 1000 }, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const port = process.env.HEADROOM_PORT || 8787;
  const isRunning = await checkHeadroom(port);
  
  if (!isRunning) {
    console.log(JSON.stringify({
      injectSteps: [
        {
          ephemeralMessage: "⚠️ [Headroom Warning]: Headroom context optimisation proxy is not running. To enable context compression and token savings, start it by running `/headroom proxy`."
        }
      ]
    }));
  } else {
    console.log(JSON.stringify({
      injectSteps: []
    }));
  }
}

main();
