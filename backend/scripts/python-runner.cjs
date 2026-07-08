const { spawnSync } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
const home = process.env.USERPROFILE || process.env.HOME || '';
const bundledPython = home
  ? path.join(home, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe')
  : '';
const candidates = [process.env.PYTHON, bundledPython, 'python', 'python3', 'py'].filter(Boolean);

let lastError = null;

for (const candidate of candidates) {
  const result = spawnSync(candidate, args, { stdio: 'inherit', shell: false });

  if (!result.error) {
    process.exit(result.status ?? 0);
  }

  lastError = result.error;
}

console.error(`Unable to find a Python executable. Last error: ${lastError?.message ?? 'unknown error'}`);
process.exit(1);
