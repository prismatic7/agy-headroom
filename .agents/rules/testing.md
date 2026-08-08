# Testing Guidelines and Standards

This document establishes the testing standards for all scripts, hooks, and commands within the `agy-headroom` plugin.

## Testing Philosophy
- **Verification First**: Every custom script or hook must be accompanied by an automated test file that executes the logic and asserts expected outputs.
- **Port Independence**: Tests must not rely on the default ports or active services of the host environment. Use parameterised ports or mock servers to test inactive states.
- **Strict Validations**: Ensure exit codes, stderr outputs, and stdout formatting (such as JSON structure) are verified.

## Test Structure & File Naming
- Test files must reside in the [`tests/`](file:///Users/chris/Development/agy-headroom/tests) directory.
- Test files must use the suffix `.test.mjs` (e.g. `headroom-hook.test.mjs`).

## Assertions & Libraries
- Use Node.js standard `assert` module for assertions to avoid external dependencies.
- Use `spawnSync` from `child_process` to execute CLI binaries/scripts and capture outputs.

## Example Test Template
```javascript
import { spawnSync } from 'child_process';
import assert from 'assert';

try {
  console.log('Running unit test...');
  
  const result = spawnSync('node', ['./scripts/my-script.mjs'], { encoding: 'utf-8' });
  const output = JSON.parse(result.stdout.trim());
  
  assert.strictEqual(result.status, 0, 'Script should exit with code 0');
  assert.deepStrictEqual(output.expectedKey, 'expectedValue', 'Verification failed');
  
  console.log('✓ Unit test passed');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
```
