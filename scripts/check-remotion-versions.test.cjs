const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

for (const scenario of ['valid', 'range', 'mixed declaration', 'mixed lock', 'missing lock']) {
  test(scenario, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-version-test-'));
    try {
      fs.mkdirSync(path.join(root, 'scripts'));
      fs.copyFileSync(path.join(__dirname, 'check-remotion-versions.cjs'), path.join(root, 'scripts/check-remotion-versions.cjs'));
      const version = '4.0.521';
      const pkg = { dependencies: { remotion: version, '@remotion/transitions': version } };
      const lock = { packages: {
        '': JSON.parse(JSON.stringify(pkg)),
        'node_modules/remotion': { version },
        'node_modules/@remotion/transitions': { version },
      } };
      if (scenario === 'range') pkg.dependencies.remotion = `^${version}`;
      if (scenario === 'mixed declaration') pkg.dependencies['@remotion/transitions'] = '4.0.447';
      if (scenario === 'mixed lock') lock.packages['node_modules/@remotion/transitions'].version = '4.0.447';
      if (scenario === 'missing lock') delete lock.packages['node_modules/@remotion/transitions'];
      fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg));
      fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify(lock));
      const result = spawnSync(process.execPath, [path.join(root, 'scripts/check-remotion-versions.cjs')], { encoding: 'utf8' });
      assert.equal(result.status, scenario === 'valid' ? 0 : 1, result.stderr);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
