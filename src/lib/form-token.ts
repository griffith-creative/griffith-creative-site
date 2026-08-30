import { createHmac, timingSafeEqual } from 'node:crypto';

// Abuse controls without a shared store: a signed timestamp on the form (rejects instant
// bot submits and stale replays) plus a per-instance IP throttle. Upgrade path is Turnstile.
// The token is minted by /api/form-token so the contact page itself can stay static and
// keep its CDN cache.
const SECRET = process.env.CONTACT_FORM_SECRET ?? process.env.RESEND_API_KEY ?? 'dev';
const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

const sign = (ts: number) => createHmac('sha256', SECRET).update(String(ts)).digest('hex');

export const signToken = (ts: number) => `${ts}.${sign(ts)}`;

export const tokenOk = (token: string) => {
  const [tsRaw, sig] = token.split('.');
  const ts = Number(tsRaw);
  if (!ts || !sig) return false;
  const expected = sign(ts);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  const age = Date.now() - ts;
  return age >= MIN_FILL_MS && age <= MAX_AGE_MS;
};
