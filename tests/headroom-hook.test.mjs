import { spawnSync } from 'child_process';
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
  return JSON.parse(result.stdout.trim());
}

try {
  console.log('Running headroom-hook tests...');

  // Test Case 1: Proxy is running (default port 8787)
  console.log('- Test Case 1: Active proxy on port 8787...');
  const activeOutput = runHook(8787);
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

  console.log('All tests passed successfully!');
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
