import { execSync, spawn } from 'child_process';
import http from 'http';

/**
 * Helper function to check if a server is responding on the given port.
 * @param {number|string} port 
 * @returns {Promise<boolean>}
 */
function checkServer(port) {
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

async function runTests() {
  console.log("Starting headroom hook unit verification tests...");

  const port = process.env.HEADROOM_PORT || 8787;
  let mockProcess = null;

  // Ensure a proxy server is active on the target port for testing
  const isRunning = await checkServer(port);
  if (!isRunning) {
    console.log(`Starting mock server on port ${port}...`);
    mockProcess = spawn('node', ['./tests/mock-server.mjs', port.toString()], { stdio: 'pipe' });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

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
    if (mockProcess) mockProcess.kill();
    process.exit(1);
  } finally {
    if (mockProcess) {
      mockProcess.kill();
    }
  }

  console.log("All unit verification tests passed.");
}

runTests();
