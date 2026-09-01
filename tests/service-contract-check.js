// Deterministic service-contract checks for the Cortex site.
// Run with: node tests/service-contract-check.js

const fs = require('fs');
const path = require('path');

const service = fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', 'service.html'), 'utf8');
const persistence = fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', 'persistence.html'), 'utf8');
const battle = fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', 'battle-tested.html'), 'utf8');
const generated = fs.readFileSync(path.join(__dirname, '..', 'public', 'docs', 'service.html'), 'utf8');

// 1. Service commands match the actual CLI.
for (const cmd of ['service install', 'service start', 'service stop', 'service restart', 'service status', 'service logs', 'service uninstall']) {
  if (!service.includes(cmd)) throw new Error(`service page is missing ${cmd}`);
}

// 2. enabled-runtime is documented, not as persistent enablement.
if (!service.includes('enabled-runtime')) throw new Error('enabled-runtime must be documented');
if (!service.includes('runtime-only enablement') || !service.includes('without leaving a persistent link')) {
  throw new Error('runtime-only enablement restoration must be described exactly');
}

// 3. Masked installation requires unmasking first.
if (!/unmask|unmasking/.test(service)) throw new Error('masked install must document unmasking first');

// 4. Uninstall preserves application data.
if (!/uninstall.*preserves|preserves.*uninstall/i.test(service)) throw new Error('uninstall must preserve data');

// 5. Lingering documented but never claimed to be automatic.
if (!service.includes('enable-linger')) throw new Error('lingering must be documented');
if (!/never enables .*lingering automatically/.test(service)) throw new Error('lingering must not be claimed automatic');
if (/automatically enables? lingering/.test(service)) throw new Error('lingering must not be claimed auto-enabled');

// 6. Migration promises preservation of rejected transcripts.
if (!/rejected/.test(persistence)) throw new Error('migration docs must mention rejected records');
if (!/preserved locally|recoverable|remain available/.test(persistence)) throw new Error('rejected transcripts must be promised preserved');

// 6a. Migration docs must not contain the obsolete one-time/empty-database claim.
for (const stale of [
  'when the database contains no conversations',
  'imports the existing browser-local sessions once',
  'After that first migration, the server is authoritative',
  'no retry when server conversations already exist',
]) {
  if (persistence.toLowerCase().includes(stale)) throw new Error(`stale migration claim present: ${stale}`);
}

// 7. Battle-tested page makes no unsupported live-systemd claim.
if (/battle-proven on every supported operating system|validated against every systemd release|production-proven rollback/i.test(battle)) {
  throw new Error('battle-tested page overclaims live systemd evidence');
}
if (!battle.includes('has not been proven through destructive live-service failure injection')) {
  throw new Error('battle-tested page must state the destructive-live-injection caveat');
}
if (!battle.includes('model-based')) throw new Error('battle-tested page must label service evidence as model-based');

// 8. Generated output is current.
if (!generated.includes('enabled-runtime')) throw new Error('generated service page is stale');

console.log('cortex service-contract check: ok');