import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import after setting up vi so we can reset module state
let checkRateLimit: (ip: string, limit?: number) => boolean;
let checkLoginRateLimit: (email: string, ip: string) => boolean;
let getClientIp: (headers: { get: (k: string) => string | null | undefined }) => string;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('./rateLimit');
  checkRateLimit = mod.checkRateLimit;
  checkLoginRateLimit = mod.checkLoginRateLimit;
  getClientIp = mod.getClientIp;
});

describe('checkRateLimit', () => {
  it('allows requests under limit', () => {
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit('1.2.3.4')).toBe(true);
    }
  });

  it('blocks when limit exceeded', () => {
    for (let i = 0; i < 20; i++) checkRateLimit('5.5.5.5');
    expect(checkRateLimit('5.5.5.5')).toBe(false);
  });

  it('different IPs are independent', () => {
    for (let i = 0; i < 20; i++) checkRateLimit('9.9.9.9');
    expect(checkRateLimit('8.8.8.8')).toBe(true);
  });
});

describe('checkLoginRateLimit', () => {
  it('allows up to 10 attempts', () => {
    for (let i = 0; i < 10; i++) {
      expect(checkLoginRateLimit('user@test.com', '1.1.1.1')).toBe(true);
    }
  });

  it('blocks on 11th attempt', () => {
    for (let i = 0; i < 10; i++) checkLoginRateLimit('locked@test.com', '2.2.2.2');
    expect(checkLoginRateLimit('locked@test.com', '2.2.2.2')).toBe(false);
  });

  it('treats emails case-insensitively', () => {
    for (let i = 0; i < 10; i++) checkLoginRateLimit('CASE@test.com', '3.3.3.3');
    expect(checkLoginRateLimit('case@test.com', '3.3.3.3')).toBe(false);
  });
});

describe('getClientIp', () => {
  it('returns last IP from x-forwarded-for chain', () => {
    const headers = { get: (k: string) => k === 'x-forwarded-for' ? '10.0.0.1, 172.16.0.1, 1.2.3.4' : null };
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const headers = { get: (k: string) => k === 'x-real-ip' ? '5.6.7.8' : null };
    expect(getClientIp(headers)).toBe('5.6.7.8');
  });

  it('returns unknown when no IP header', () => {
    const headers = { get: () => null };
    expect(getClientIp(headers)).toBe('unknown');
  });
});
