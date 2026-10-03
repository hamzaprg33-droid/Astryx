const crypto = require('crypto');

const SESSION_DAYS = 30;
const key = () => crypto.createHash('sha256').update(String(process.env.SESSION_SECRET)).digest();

// The session holds Discord OAuth tokens, so it is encrypted (AES-256-GCM), not just signed.
const seal = (data) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64url');
};

const open = (token) => {
  if (!token) return null;
  try {
    const buf = Buffer.from(token, 'base64url');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8'));
  } catch {
    return null;
  }
};

const parseCookies = (req) =>
  Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );

const appendCookie = (res, cookie) => {
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(prev ? [].concat(prev) : []), cookie]);
};

const setSessionCookie = (res, session) =>
  appendCookie(res, `session=${seal(session)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 24 * 3600}`);

const clearCookie = (res, name) => appendCookie(res, `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);

const buildSession = (user, tokens) => ({
  id: user.id,
  name: user.global_name || user.username,
  avatar: user.avatar,
  at: tokens.access_token,
  rt: tokens.refresh_token,
  ate: Date.now() + (tokens.expires_in || 604800) * 1000,
  exp: Date.now() + SESSION_DAYS * 24 * 3600 * 1000,
});

async function refreshTokens(rt) {
  const r = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: rt,
    }),
  });
  return r.ok ? r.json() : null;
}

async function getSession(req, res) {
  const s = open(parseCookies(req).session);
  if (!s || !s.id || s.exp < Date.now() || !s.at) return null;
  if (s.ate - 60_000 > Date.now()) return s;
  if (!s.rt) return null;
  const tokens = await refreshTokens(s.rt);
  if (!tokens) return null;
  const next = { ...s, at: tokens.access_token, rt: tokens.refresh_token || s.rt, ate: Date.now() + tokens.expires_in * 1000 };
  setSessionCookie(res, next);
  return next;
}

module.exports = { parseCookies, appendCookie, setSessionCookie, clearCookie, buildSession, getSession };
