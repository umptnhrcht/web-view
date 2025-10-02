// scripts/run-flask.mjs
import { spawn } from 'child_process';
import { getVenvEnv } from './env.mjs';
import { APP_FILE, PY_SRC_DIR, PYTHON_EXECUTABLE } from './constants.mjs';
import path from 'path';
function runFlaskApp() {
	const env = getVenvEnv();
	const proc = spawn(PYTHON_EXECUTABLE, [path.join(PY_SRC_DIR, APP_FILE)], {
		stdio: 'inherit',
		shell: true,
		env
	});

	proc.on('close', code => {
		console.log(`Flask app exited with code ${code}`);
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runFlaskApp();
}
