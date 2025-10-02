import { getVenvEnv } from './env.mjs';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import { PY_SRC_DIR, REQUIREMENTS_FILE, VENV_NAME } from './constants.mjs'


/**
 * Generates a requirements.txt file from the current packages in the venv.
 * @param {string} workingDir - Directory in which to run pip commands.
 * @param {string} venvName - The name of the venv directory, relative to workingDir.
 * @param {string} requirementsFilename - Path or filename for requirements.txt (can be relative to workingDir)
 */
export function generateRequirementsFileFromPipFreeze(workingDir, venvName, requirementsFilename = REQUIREMENTS_FILE) {
	const venvDir = path.join(workingDir, venvName);
	const env = getVenvEnv(venvDir);
	const reqFile = path.isAbsolute(requirementsFilename)
		? requirementsFilename
		: path.join(workingDir, requirementsFilename);

	try {
		const freezeOutput = execSync('pip freeze', { env, encoding: 'utf8' });
		fs.writeFileSync(reqFile, freezeOutput, { encoding: 'utf8' });
		console.log(`Created ${reqFile} from pip freeze in venv '${venvDir}'.`);
	} catch (err) {
		console.error('Error generating requirements.txt from pip freeze:', err.message);
		process.exit(1);
	}
}

// If run directly, ensure the venv exists, then sync/install/list
if (import.meta.url === `file://${process.argv[1]}`) {
	generateRequirementsFileFromPipFreeze(PY_SRC_DIR, VENV_NAME);
}