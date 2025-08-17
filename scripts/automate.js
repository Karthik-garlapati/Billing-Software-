#!/usr/bin/env node
// Simple automation script: build project, report bundle sizes, optional preview smoke check.
// Usage: node scripts/automate.js [--preview]

import { execSync, spawn } from 'node:child_process';
import { statSync, readdirSync } from 'node:fs';
import path from 'node:path';

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf-8', ...opts });
  process.stdout.write(out);
  return out;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB','MB','GB'];
  let i = -1; let val = bytes;
  do { val /= 1024; i++; } while (val >= 1024 && i < units.length - 1);
  return val.toFixed(2) + ' ' + units[i];
}

function listDistFiles() {
  const distDir = path.resolve('dist');
  try {
    const files = readdirSync(distDir, { withFileTypes: true });
    console.log('\nBundle artifacts:');
    files.forEach(f => {
      if (f.isFile()) {
        const p = path.join(distDir, f.name);
        const size = statSync(p).size;
        console.log(` - ${f.name} (${formatSize(size)})`);
      }
    });
  } catch (e) {
    console.warn('Could not list dist files:', e.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  console.log('Automation: build & report');
  run('npm run build');
  listDistFiles();
  if (preview) {
    console.log('\nStarting preview server (will run for 10s)...');
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run','serve'], { stdio: 'pipe' });
    let collected = '';
    child.stdout.on('data', d => { collected += d.toString(); process.stdout.write(d); });
    child.stderr.on('data', d => process.stderr.write(d));
    // After 10s, exit.
    setTimeout(()=> {
      console.log('\n[automation] Stopping preview server.');
      child.kill();
      // Simple smoke assertion: look for 'ready in' or 'Local'
      if (/Local|preview/i.test(collected)) {
        console.log('Smoke check: PASS (server output detected)');
        process.exit(0);
      } else {
        console.error('Smoke check: Could not detect server readiness.');
        process.exit(1);
      }
    }, 10000);
  }
}

main().catch(e => { console.error('Automation failed:', e); process.exit(1); });
