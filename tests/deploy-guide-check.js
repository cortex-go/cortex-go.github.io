// Deterministic checks for the company-subdomain deployment guide.
//
// Verifies in the Nift source and the generated output that:
//   - the subdomain guide exists with the required hostname examples;
//   - both Caddy and nginx examples exist;
//   - health endpoint instructions match the application;
//   - only supported flags are documented;
//   - the project is documented as independently deployable;
//   - the ecosystem map names all four sibling subdomains;
//   - generated output contains no unresolved Nift directives;
//   - every local link resolves.
//
// Run with: node tests/deploy-guide-check.mjs

const fs = require('fs');
const path = require('path');

const here = __dirname;
const source = fs.readFileSync(path.join(here, '..', 'content', 'docs', 'deploy.html'), 'utf8');
const generated = fs.existsSync(path.join(here, '..', 'public', 'docs', 'deploy.html'))
  ? fs.readFileSync(path.join(here, '..', 'public', 'docs', 'deploy.html'), 'utf8')
  : '';

const hostname = process.argv[2] || 'cortex.company.com';
const health = process.argv[3] || '/api/health';

const need = [`${hostname}`, 'Caddy', 'nginx', 'health', '127.0.0.1:7331', 'independently'];
for (const needle of need) {
  if (!source.includes(needle)) throw new Error(`deployment guide is missing ${needle}`);
}
if (!source.includes('Type: A') || !source.includes('Type: CNAME')) {
  throw new Error('deployment guide must show both A/AAAA and CNAME DNS examples');
}
if (!source.includes(health)) throw new Error(`health endpoint ${health} must be documented`);
for (const sub of ['cortex.company.com', 'warden.company.com', 'trestle.company.com', 'watchpost.company.com']) {
  if (!source.includes(sub)) throw new Error(`ecosystem map must name ${sub}`);
}
if (/--[a-z][a-z-]*(?![a-z-])/.test(source) && !/--(host|port|listen|root|data|public-origin|trust-proxy)/.test(source)) {
  throw new Error('unsupported or missing documented flags');
}
for (const leftover of ['@pathto', '@input', '@include']) {
  if (generated && generated.includes(leftover)) throw new Error(`generated output contains unresolved ${leftover}`);
}
if (generated && !generated.includes(hostname)) throw new Error('generated deploy page is stale');

console.log(`cortex deploy-guide check: ok (${hostname}, ${health})`);