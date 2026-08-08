import { spawnSync, spawn } from 'child_process';
import assert from 'assert';

/**
 * Headroom Hook Tests
 * Verifies that the headroom hook correctly detects running/non-running
 * instances of the headroom proxy and outputs the correct JSON payloads.
 */

function runHook(port) {
  const result = spawnSync('node', ['./scripts/headroom-hook.mjs'], {
    env: { ...process.env, HEADROOM_PORT: port.toString() },
    encoding: 'utf-8'
  });
  if (result.stderr.trim()) {
    console.error('Child Process Stderr:', result.stderr);
  }
  return JSON.parse(result.stdout.trim());
}

console.log('Spawning mock headroom server...');
const mockServerProc = spawn('node', ['./tests/mock-server.mjs', '0']);

mockServerProc.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output.startsWith('MOCK_SERVER_READY:')) {
    const mockPort = parseInt(output.split(':')[1], 10);
    console.log(`Mock server is ready on port ${mockPort}`);
    
    try {
      console.log('Running headroom-hook tests...');

      // Test Case 1: Proxy is running (using mock port)
      console.log(`- Test Case 1: Active proxy on mock port ${mockPort}...`);
      const activeOutput = runHook(mockPort);
      assert.deepStrictEqual(
        activeOutput.injectSteps,
        [],
        'Expected empty injectSteps when the proxy is running.'
      );
      console.log('  ✓ Passed');

      // Test Case 2: Proxy is down (using an unused port, e.g. 59999)
      console.log('- Test Case 2: Inactive proxy on port 59999...');
      const inactiveOutput = runHook(59999);
      assert.strictEqual(inactiveOutput.injectSteps.length, 1, 'Expected one injected step.');
      assert.ok(
        inactiveOutput.injectSteps[0].ephemeralMessage.includes('Headroom Warning'),
        'Expected warning message in the injected steps.'
      );
      console.log('  ✓ Passed');

      // Test Case 3: Invalid port validation
      console.log('- Test Case 3: Invalid port validation (out of range)...');
      const invalidResult = spawnSync('node', ['./scripts/headroom-hook.mjs'], {
        env: { ...process.env, HEADROOM_PORT: '999999' },
        encoding: 'utf-8'
      });
      assert.notStrictEqual(invalidResult.status, 0, 'Script should exit with non-zero code for invalid port');
      assert.ok(
        invalidResult.stderr.includes('Invalid HEADROOM_PORT'),
        'Expected port validation error in stderr.'
      );
      console.log('  ✓ Passed');

      console.log('All tests passed successfully!');
      mockServerProc.kill();
      process.exit(0);
    } catch (error) {
      console.error('Test execution failed:', error.message);
      mockServerProc.kill();
      process.exit(1);
    }
  }
});

mockServerProc.stderr.on('data', (data) => {
  console.error('Mock Server Stderr:', data.toString());
});

mockServerProc.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`Mock server exited with code ${code}`);
    process.exit(1);
  }
});
