import { describe, expect, it } from 'vitest';
import { sanitizeRequestPath } from './logger.js';

describe('sanitizeRequestPath', () => {
  it('removes query strings from logged paths', () => {
    expect(sanitizeRequestPath('/webhooks?cursor=secret')).toBe('/webhooks');
  });

  it('redacts ingest keys from hook paths', () => {
    expect(sanitizeRequestPath('/hooks/sensitive-key?source=stripe')).toBe(
      '/hooks/[redacted]',
    );
  });

  it('keeps non-hook route paths intact', () => {
    expect(sanitizeRequestPath('/webhooks/web_abc/requests')).toBe(
      '/webhooks/web_abc/requests',
    );
  });
});
