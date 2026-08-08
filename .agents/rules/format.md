# Code Formatting and Style Rules

This document outlines the code formatting standards and guidelines for the `agy-headroom` project.

## General Conventions
- **Language**: JavaScript (ES Modules syntax).
- **Indentation**: 2 spaces (no tabs).
- **Line Endings**: LF.
- **Line Length**: Max 120 characters per line.
- **Spelling**: Australian English (e.g. optimising, cacheing, utilising, behaviour).

## Naming Conventions
- **Files**: Use kebab-case for script and configuration filenames (e.g., `headroom-hook.mjs`).
- **Variables & Functions**: Use camelCase (e.g., `checkHeadroom`, `portNumber`).
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `DEFAULT_PORT`).
- **Classes**: Use PascalCase if applicable.

## Comments & Documentation
- All scripts must start with a descriptive JSDoc block detailing the purpose and usage.
- Inline comments should explain non-obvious logic, especially when dealing with asynchronous control flow or process execution.
- Maintain accurate and descriptive parameter names in JSDoc for functions.

## JavaScript (ESM) Standards
- Use `import` and `export` statements rather than `require` or `module.exports`.
- Handle promise rejections and try-catch blocks cleanly to avoid unhandled rejections.
- Minimise external runtime dependencies. Prefer Node.js native APIs (e.g., `http`, `child_process`, `fs`).

## Gold Standard Example
```javascript
/**
 * Pings a specific port to check if the server responds with 200 OK.
 * @param {number} port - The port number to query.
 * @returns {Promise<boolean>} Resolves to true if the server is healthy.
 */
export function checkServerHealth(port) {
  return new Promise((resolve) => {
    const request = http.get(`http://127.0.0.1:${port}/stats`, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });

    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}
```
