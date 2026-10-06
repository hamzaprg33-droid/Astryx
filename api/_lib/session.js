const crypto = require('crypto');

const API = 'https://discord.com/api/v10';
const DAYS = 30;

const key = () => crypto.createHash('sha256').update(process.env.SESSION_SECRET || '').digest();

// Verschlüsselt (AES-256-GCM) – das Cookie enthält auch den OAuth-Token und darf nicht lesbar sein.
const seal = (obj) => {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
};

const unseal = (token) => {
  try {
    const b = Buffer.from(token, 'base64url');
    const d = crypto.createDecipheriv('aes-256-gcm', key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'));
  } catch { return null; }
};

const parseCookies = (req) =>
  Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, v.join('=')])
  );

const readSession = (req) => {
  const raw = parseCookies(req).session;
  if (!raw) return null;
  const s = unseal(raw);
  if (!s || !s.exp || s.exp < Date.now()) return null;
  return s;
};

const sessionCookie = (s) =>
  `session=${seal(s)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.max(1, Math.floor((s.exp - Date.now()) / 1000))}`;

const shortCookie = (name, value) =>
  `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;

const clearCookie = (name) => `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

// Access-Token bei Discord erneuern. Gibt die neue Session zurück (und setzt das Cookie) oder null.
const refreshSession = async (res, s) => {
  try {
    if (!s.rt) return null;
    const r = await fetch(`${API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: s.rt,
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const n = { ...s, at: d.access_token, rt: d.refresh_token, te: Date.now() + d.expires_in * 1000 };
    const prev = res.getHeader('Set-Cookie');
    res.setHeader('Set-Cookie', [...(prev ? [].concat(prev) : []), sessionCookie(n)]);
    return n;
  } catch { return null; }
};

// Liefert die Session. Ist der Token laut Ablaufzeit abgelaufen, wird er erneuert;
// scheitert das, entscheidet erst Discord selbst (siehe userGuilds), ob der Token noch geht.
const getFreshSession = async (req, res) => {
  const s = readSession(req);
  if (!s) return null;
  if (Number.isFinite(s.te) && s.te < Date.now() + 60000) return (await refreshSession(res, s)) || s;
  return s;
};

module.exports = { API, DAYS, seal, unseal, parseCookies, readSession, sessionCookie, shortCookie, clearCookie, refreshSession, getFreshSession };
