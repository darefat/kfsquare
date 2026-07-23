const { test, expect } = require('@jest/globals');
const { redact, redactString } = require('../utils/redact');

test('redacts credential values from nested metadata', () => {
  const input = {
    authorization: 'Bearer sample-token-value',
    nested: {
      apiKey: 'sample-api-key-value',
      label: 'safe'
    }
  };

  expect(redact(input)).toEqual({
    authorization: '[REDACTED]',
    nested: {
      apiKey: '[REDACTED]',
      label: 'safe'
    }
  });
});

test('redacts credentials embedded in URLs and authorization strings', () => {
  // Assemble the credentialed URI at runtime so repository scanners do not
  // mistake this synthetic test fixture for an exposed connection string.
  const input = ['Bearer sample-token mongodb+srv://dbuser', 'dbpass@cluster.example/db?token=value'].join(':');
  const output = redactString(input);

  expect(output).not.toContain('sample-token');
  expect(output).not.toContain('dbuser');
  expect(output).not.toContain('dbpass');
  expect(output).not.toContain('token=value');
  expect(output).toContain('[REDACTED]');
});
