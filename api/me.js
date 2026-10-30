const { readSession } = require('./_lib/session');
const { bot } = require('./_lib/discord');

const MAIN_GUILD = '1565293644171186227';
const BETA_ROLE = '1564767142136516689';

// Einfacher In-Memory-Cache pro Instanz (Vercel kaltstartet oft, reicht für Rate-Limits)
const betaCache = new Map(); // userId -> { at, has }
const BETA_TTL = 5 * 60 * 1000;

async function hasBeta(userId) {
  const hit = betaCache.get(userId);
  if (hit && Date.now() - hit.at < BETA_TTL) return hit.has;
  try {
    const r = await bot(`/guilds/${MAIN_GUILD}/members/${userId}`);
    if (!r.ok) {
      betaCache.set(userId, { at: Date.now(), has: false });
      return false;
    }
    const m = await r.json();
    const has = Array.isArray(m.roles) && m.roles.includes(BETA_ROLE);
    betaCache.set(userId, { at: Date.now(), has });
    return has;
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const s = readSession(req);
  if (!s) return res.status(401).json({ user: null });
  const beta = await hasBeta(s.id);
  res.json({ user: { id: s.id, name: s.name, avatar: s.avatar }, beta });
};
