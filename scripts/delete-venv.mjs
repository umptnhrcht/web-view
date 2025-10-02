import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { PY_SRC_DIR, VENV_NAME } from './constants.mjs';

/**
 * Deletes the specified virtual environment folder if it exists.
 * @param {string} workingDir - The parent directory (absolute or relative)
 * @param {string} venvName - The name of the venv directory (relative to workingDir)
 */
export async function deleteVenv(workingDir, venvName) {
	const venvDir = path.join(workingDir, venvName);
	if (!fsSync.existsSync(venvDir)) {
		console.log(`[INFO] No venv found at: ${venvDir}`);
		return;
	}
	try {
		await fs.rm(venvDir, { recursive: true, force: true });
		console.log(`[SUCCESS] Deleted virtual environment at: ${venvDir}`);
	} catch (err) {
		console.error(`[ERROR] Failed to delete venv at ${venvDir}:`, err.message);
		process.exit(1);
	}
}

// If run directly, can perform a sample deletion (customize as needed)
if (import.meta.url === `file://${process.argv[1]}`) {
	// Example: node scripts/delete-venv.mjs py-src myvenv
	const [_node, _script, workingDir = PY_SRC_DIR, venvName = VENV_NAME] = process.argv;
	await deleteVenv(workingDir, venvName);
}