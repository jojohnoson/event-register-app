import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'joel';
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'registerhub-secret-admin-key-2026';

/**
 * Generate a deterministic time-stamped signature token for admin authentication
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(`admin:${timestamp}`);
  const signature = hmac.digest('hex');
  return Buffer.from(JSON.stringify({ role: 'admin', timestamp, signature })).toString('base64');
}

/**
 * Verify if provided token is valid
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;

  // Also support direct secret key verification if passed as x-admin-key
  if (token === ADMIN_PASSWORD) return true;

  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);

    if (parsed.role !== 'admin' || !parsed.timestamp || !parsed.signature) {
      return false;
    }

    // Check token age (valid for 7 days)
    const tokenTime = parseInt(parsed.timestamp, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(tokenTime) || Date.now() - tokenTime > maxAge) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(`admin:${parsed.timestamp}`);
    const expectedSig = hmac.digest('hex');

    return crypto.timingSafeEqual(Buffer.from(parsed.signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * Validate admin password
 */
export function validateAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}

/**
 * Check authorization from Next.js Request object
 */
export function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  const customHeader = request.headers.get('x-admin-token') || request.headers.get('x-admin-key');

  if (customHeader && (customHeader === ADMIN_PASSWORD || verifyAdminToken(customHeader))) {
    return true;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token) || token === ADMIN_PASSWORD;
  }

  return false;
}
