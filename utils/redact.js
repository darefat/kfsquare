'use strict';

/**
 * Redact credentials before values reach logs, diagnostics, or error output.
 * This is defense in depth; callers should still avoid logging request bodies
 * and provider response objects when those details are unnecessary.
 */
const SENSITIVE_KEY = /(?:authorization|cookie|password|passwd|secret|token|api[-_]?key|private[-_]?key|client[-_]?secret|access[-_]?key|session|credential)/i;
const SECRET_VALUE_PATTERNS = [
  /\b(?:Basic|Bearer)\s+[A-Za-z0-9._~+/=-]+/gi,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bAIza[0-9A-Za-z_-]{30,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  /\bkey-[A-Za-z0-9]{24,}\b/g,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  /((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/)([^\s/@:]+):([^\s/@]+)@/gi,
  /([?&](?:api[-_]?key|access[-_]?token|token|secret|password)=)[^&#\s]*/gi
];

function redactString(value) {
  return SECRET_VALUE_PATTERNS.reduce((result, pattern) => {
    if (pattern.source.includes('mongodb')) {
      return result.replace(pattern, '$1[REDACTED]:[REDACTED]@');
    }
    if (pattern.source.startsWith('([?&]')) {
      return result.replace(pattern, '$1[REDACTED]');
    }
    return result.replace(pattern, '[REDACTED]');
  }, String(value));
}

function redact(value, seen = new WeakSet()) {
  if (typeof value === 'string') return redactString(value);
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return '[REDACTED BUFFER]';
  if (seen.has(value)) return '[CIRCULAR]';

  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => redact(entry, seen));

  const sanitized = {};
  for (const [key, entry] of Object.entries(value)) {
    sanitized[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(entry, seen);
  }
  return sanitized;
}

module.exports = { redact, redactString };
