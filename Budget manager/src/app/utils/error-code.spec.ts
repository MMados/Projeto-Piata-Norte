import { errorCode } from './error-code';

describe('errorCode', () => {
  it('returns a structured error code', () => {
    expect(errorCode({ code: 'auth/user-not-found', message: 'private details' })).toBe(
      'auth/user-not-found',
    );
  });

  it('returns a safe fallback when no structured code is available', () => {
    expect(errorCode(new Error('private details'))).toBe('unknown-error');
    expect(errorCode(null)).toBe('unknown-error');
  });
});
