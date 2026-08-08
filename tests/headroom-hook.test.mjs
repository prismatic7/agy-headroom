import { spawnSync, spawn } from 'child_process';
import assert from 'assert';

/**
 * Headroom Hook Tests
 * Verifies that the headroom hook correctly detects running/non-running
 * instances of the headroom proxy and handles valid/invalid configurations.
 */

/**
 * Helper to start the mock headroom server deterministically by listening
 * for the `MOCK_SERVER_READY:<port>` signal on stdout.
 * @param {number} port - Desired port (0 for random free port)
 * @returns {Promise<{port: number, process: import('child_process').ChildProcess}>}
 */
function startMockServer(port = 0) {
  return new Promise((resolve, reject) => {
    const mockProcess = spawn('node', ['./tests/mock-server.mjs', port.toString()]);

    mockProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output.startsWith('MOCK_SERVER_READY:')) {
        const boundPort = parseInt(output.split(':')[1], 10);
        resolve({ port: boundPort, process: mockProcess });
      }
    });

    mockProcess.stderr.on('data', (data) => {
      console.error('Mock Server Stderr:', data.toString());
    });

    mockProcess.on('error', (err) => {
      reject(new Error(`Failed to start mock server: ${err.message}`));
    });

    mockProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        reject(new Error(`Mock server exited unexpectedly with code ${code}`));
      }
    });
  });
}

/**
 * Runs the headroom hook with a specified port and captures stdout/stderr.
 * @param {number|string} port 
 * @returns {{ stdout: string, stderr: string, status: number|null, parsed: any }}
 */
function runHook(port) {
  const result = spawnSync('node', ['./scripts/headroom-hook.mjs'], {
    env: { ...process.env, HEADROOM_PORT: port.toString() },
    encoding: 'utf-8'
  });
  let parsed = null;
  if (result.stdout.trim()) {
    try {
      parsed = JSON.parse(result.stdout.trim());
    } catch {
      // Ignore JSON parse errors if stdout is not JSON
    }
  }
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
    parsed
  };
}

async function runTests() {
  console.log('Starting headroom hook unit verification tests...');
  let mockServerObj = null;

  try {
    // Start mock server deterministically
    console.log('Spawning mock headroom server...');
    mockServerObj = await startMockServer(0);
    console.log(`Mock server is ready on port ${mockServerObj.port}`);

    // Test Case 1: Active proxy (using mock server port)
    console.log(`- Test Case 1: Active proxy on mock port ${mockServerObj.port}...`);
    const activeRes = runHook(mockServerObj.port);
    assert.strictEqual(activeRes.status, 0, 'Hook should exit with code 0 for active proxy.');
    assert.ok(activeRes.parsed, 'Hook output should be valid JSON.');
    assert.deepStrictEqual(
      activeRes.parsed.injectSteps,
      [],
      'Expected empty injectSteps when the proxy is active.'
    );
    console.log('  ✓ Passed: Hook returns valid JSON when proxy is active.');

    // Test Case 2: Inactive proxy (using an unused port, e.g. 59999)
    console.log('- Test Case 2: Inactive proxy on port 59999...');
    const inactiveRes = runHook(59999);
    assert.strictEqual(inactiveRes.status, 0, 'Hook should exit with code 0 for inactive proxy fallback.');
    assert.ok(inactiveRes.parsed, 'Hook output should be valid JSON.');
    assert.strictEqual(inactiveRes.parsed.injectSteps.length, 1, 'Expected one injected warning step.');
    assert.ok(
      inactiveRes.parsed.injectSteps[0].ephemeralMessage.includes('Headroom Warning'),
      'Expected warning message in injected steps.'
    );
    assert.ok(
      inactiveRes.stderr.includes('Headroom Warning'),
      'Expected warning message printed to stderr.'
    );
    console.log('  ✓ Passed: Hook handles inactive proxy and returns warning payload.');

    // Test Case 3: Invalid port validation (out of range)
    console.log('- Test Case 3: Invalid port validation (out of range)...');
    const invalidRes = runHook(999999);
    assert.notStrictEqual(invalidRes.status, 0, 'Script should exit with non-zero code for invalid port.');
    assert.ok(
      invalidRes.stderr.includes('Invalid HEADROOM_PORT'),
      'Expected port validation error in stderr.'
    );
    console.log('  ✓ Passed: Hook exits with error for invalid HEADROOM_PORT.');

    console.log('All unit verification tests passed successfully.');
  } catch (err) {
    console.error('✗ Test suite failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (mockServerObj && mockServerObj.process) {
      mockServerObj.process.kill();
    }
  }
}

runTests();
