const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const version = pkg.dependencies?.remotion;
const isRemotion = (name) => name === 'remotion' || name.startsWith('@remotion/');
const errors = [];
if (!/^\d+\.\d+\.\d+$/.test(version || '')) errors.push('remotion must use an exact stable version');
for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  for (const [name, declared] of Object.entries(pkg[section] || {})) {
    if (!isRemotion(name)) continue;
    if (declared !== version) errors.push(`${name}: declaration ${declared} differs from ${version}`);
    if (lock.packages?.['']?.[section]?.[name] !== declared) errors.push(`${name}: lock root differs`);
    if (lock.packages?.[`node_modules/${name}`]?.version !== version) errors.push(`${name}: resolved lock differs`);
  }
}
for (const [location, entry] of Object.entries(lock.packages || {})) {
  const name = location.split('node_modules/').at(-1);
  if (isRemotion(name) && entry.version !== version) errors.push(`${location}: mixed resolved version ${entry.version}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`All Remotion declarations and lock resolutions match ${version}`);
}
