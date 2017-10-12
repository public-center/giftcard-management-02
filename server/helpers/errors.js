import child_process from 'child_process';

/**
 * Get current git revision
 */
export function getGitRev() {
  return child_process
  .execSync('git rev-parse HEAD')
  .toString().trim();
}
