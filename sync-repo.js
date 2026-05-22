const { execSync } = require('child_process');

function run(cmd) {
  try {
    console.log(`\x1b[36mRunning:\x1b[0m ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`\x1b[31mError executing command:\x1b[0m ${cmd}`);
    return false;
  }
}

console.log("🌌 \x1b[35mStarting Somnium Repo Auto-Sync...\x1b[0m");

// Check if git is initialized
try {
  execSync('git status', { stdio: 'ignore' });
} catch (e) {
  console.log("Git is not initialized. Initializing now...");
  if (!run('git init')) {
    process.exit(1);
  }
  run('git branch -M main');
}

// Run git add
run('git add .');

// Check if there are changes to commit
let hasChanges = false;
try {
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    hasChanges = true;
  }
} catch (e) {
  hasChanges = true; // Fallback
}

if (!hasChanges) {
  console.log("✨ \x1b[32mNo changes to commit. Everything is up to date!\x1b[0m");
} else {
  const commitMsg = `update Somnium: automatic sync at ${new Date().toLocaleString()}`;
  run(`git commit -m "${commitMsg}"`);
}

// Try pushing if remote exists
try {
  const remotes = execSync('git remote').toString().trim();
  if (remotes) {
    console.log("Pushing to remote repository...");
    run('git push -u origin main');
  } else {
    console.log("\n⚠️  \x1b[33mNo remote repository configured yet.\x1b[0m");
    console.log("To connect this to GitHub, run these commands in your shell:");
    console.log("  git remote add origin https://github.com/<your-username>/DreamVault.git");
    console.log("  node sync-repo.js\n");
  }
} catch (e) {
  console.error("Failed to check remote or push.", e.message);
}

console.log("🌌 \x1b[35mAuto-Sync completed!\x1b[0m");
