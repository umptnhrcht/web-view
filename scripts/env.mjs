import os from 'os';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PY_SRC_DIR, VENV_NAME } from './constants.mjs';


/**
 * Ensures the Python virtual environment exists. If not, creates it.
 * @param {string} venvDir - Path to the virtual environment directory (e.g., 'py-src/venv')
 */
export function ensureVenvExists(venvDir) {
	let activateScript;
	if (os.platform() === 'win32') {
		activateScript = path.join(venvDir, 'Scripts', 'activate');
	} else {
		activateScript = path.join(venvDir, 'bin', 'activate');
	}

	if (fs.existsSync(activateScript)) {
		console.log(`[OK] Virtual environment exists at ${venvDir}`);
	} else {
		console.log(`[INFO] Virtual environment not found at ${venvDir}. Creating...`);
		execSync(`python3 -m venv "${venvDir}"`, { stdio: 'inherit' });
		console.log(`[SUCCESS] Virtual environment created at ${venvDir}`);
	}
}


/**
 * Returns an environment object with PATH and VIRTUAL_ENV modified
 * so pip/python commands use the specified venv.
 * @param {string} venvDir - Path to virtual environment (e.g., 'py-src/venv')
 * @returns {Object} Environment object for execSync/spawn/etc.
 */
export function getVenvEnv(venvDir = path.join(PY_SRC_DIR, VENV_NAME)) {
	ensureVenvExists(venvDir);
	let binDir;
	if (os.platform() === 'win32') {
		binDir = path.join(venvDir, 'Scripts');
	} else {
		binDir = path.join(venvDir, 'bin');
	}
	const env = { ...process.env };
	env.PATH = binDir + path.delimiter + env.PATH;
	env.VIRTUAL_ENV = path.resolve(venvDir);
	return env;
}
