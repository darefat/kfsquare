#!/usr/bin/env node
'use strict';

/**
 * Lightweight repository secret scanner used by npm run security:secrets.
 * It reports only signature type and file location; matched values are never
 * printed. Generated dependencies and Git internals are intentionally skipped.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'logs', 'coverage', 'dist', 'build']);
const BINARY_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.gz', '.woff', '.woff2']);
const ALLOWED_ENV_FILES = new Set(['.env.example', '.env.compose.example']);

const signatures = [
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g],
  ['Stripe secret key', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g],
  ['Mailgun private key', /\bkey-[A-Za-z0-9]{24,}\b/g],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g],
  ['JWT token', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['Credentialed database URI', /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^\s/:@<>]+:[^\s/@<>]+@/gi]
];

const SENSITIVE_ASSIGNMENT = /^[ \t]*(?:export[ \t]+)?([A-Z0-9_]*(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET|WEBHOOK_SECRET)[A-Z0-9_]*)[ \t]*[=:][ \t]*["']?([^\s"'`#,;]*)/gim;
const SAFE_VALUE = /^(?:|<[^>]+>|\$\{[^}]+\}|\$[A-Z0-9_]+|process\.env\.[A-Z0-9_]+)$/i;
const SAFE_WORDS = /(?:example|placeholder|change[-_]?me|your[-_]|xxxx|set[-_](?:in|at|locally)|generate)/i;
const findings = [];

function scanDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(absolutePath);
      continue;
    }

    const relativePath = path.relative(ROOT, absolutePath);
    if (entry.name.startsWith('.env') && !ALLOWED_ENV_FILES.has(entry.name)) {
      findings.push({ type: 'Environment file present', file: relativePath, line: 1 });
      continue;
    }
    if (BINARY_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    let content;
    try {
      content = fs.readFileSync(absolutePath, 'utf8');
    } catch {
      continue;
    }
    if (content.includes('\0')) continue;

    for (const [type, pattern] of signatures) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const line = content.slice(0, match.index).split('\n').length;
        findings.push({ type, file: relativePath, line });
      }
    }

    // Catch provider-specific credentials that do not have a known prefix.
    // Only environment-style uppercase assignments are considered to keep
    // ordinary source variables from producing noisy false positives.
    SENSITIVE_ASSIGNMENT.lastIndex = 0;
    let assignment;
    while ((assignment = SENSITIVE_ASSIGNMENT.exec(content)) !== null) {
      const value = assignment[2];
      if (SAFE_VALUE.test(value) || SAFE_WORDS.test(value)) continue;
      if (value.length < 16) continue;

      const line = content.slice(0, assignment.index).split('\n').length;
      findings.push({ type: `Sensitive assignment (${assignment[1]})`, file: relativePath, line });
    }
  }
}

scanDirectory(ROOT);

if (findings.length) {
  console.error(`Secret scan failed with ${findings.length} potential finding(s):`);
  for (const finding of findings) {
    console.error(`- ${finding.type}: ${finding.file}:${finding.line}`);
  }
  process.exitCode = 1;
} else {
  console.log('Secret scan passed: no known credential signatures found.');
}
