const apiRateMap = new Map<string, { count: number; resetAt: number }>();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit = 20): boolean {
  const now = Date.now();
  const entry = apiRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    apiRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function checkLoginRateLimit(email: string, ip: string): boolean {
  const key = `${email.toLowerCase()}:${ip}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export function getClientIp(headers: { get: (k: string) => string | null | undefined }): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',').pop()?.trim() ?? 'unknown';
  return headers.get('x-real-ip') ?? 'unknown';
}
