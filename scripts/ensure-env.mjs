import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getVenvEnv } from './env.mjs';
import { PY_SRC_DIR, REQUIREMENTS_FILE, VENV_NAME } from './constants.mjs';

/**
 * Sync Python venv with requirements.txt (if present) and list installed packages.
 * @param {string} venvDir - Path to the virtual environment directory (e.g., 'py-src/venv')
 * @param {string} [requirementsPath] - Path to requirements.txt (defaults to project root)
 */
function syncRequirementsAndListPackages(workingDir = PY_SRC_DIR, venvDirName = VENV_NAME, requirementsFile = REQUIREMENTS_FILE) {
	const venvDir = path.join(workingDir, venvDirName)
	const requirementsPath = path.join(workingDir, requirementsFile);
	const env = getVenvEnv(venvDir);
	try {
		if (fs.existsSync(requirementsPath)) {
			console.log(`Found ${requirementsPath}. Installing dependencies...`);
			execSync(`pip install -r "${requirementsPath}"`, { stdio: 'inherit', env });
		} else {
			console.log(`${requirementsPath} not found. Skipping pip install.`);
		}

		console.log('\nInstalled pip packages:');
		execSync('pip list', { stdio: 'inherit', env });

	} catch (err) {
		console.error('Error during pip operations:', err.message);
		process.exit(1);
	}
}

// If run directly, ensure the venv exists, then sync/install/list
if (import.meta.url === `file://${process.argv[1]}`) {
	syncRequirementsAndListPackages();
}