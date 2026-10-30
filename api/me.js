const { readSession } = require('./_lib/session');

const MAIN_GUILD = process.env.BETA_MAIN_GUILD || '1565293644171186227';
const BETA_ROLE = process.env.BETA_ROLE_ID || '1564767142136516689';

const betaCache = new Map();
// Positiv länger cachen, negativ nur kurz – sonst bleibt „keine Rolle“ hängen
const BETA_TTL_YES = 2 * 60 * 1000;  // 2 Min
const BETA_TTL_NO  = 20 * 1000;      // 20 Sek

async function hasBeta(userId) {
  const hit = betaCache.get(userId);
  if (hit) {
    const ttl = hit.has ? BETA_TTL_YES : BETA_TTL_NO;
    if (Date.now() - hit.at < ttl) return hit.has;
  }
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return false;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const r = await fetch(`https://discord.com/api/v10/guilds/${MAIN_GUILD}/members/${userId}`, {
      headers: { Authorization: `Bot ${token}` },
      signal: ctrl.signal,
    });
    clearTimeout(t);
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

  const user = { id: s.id, name: s.name, avatar: s.avatar };
  let beta = false;
  try {
    beta = await Promise.race([
      hasBeta(s.id),
      new Promise((resolve) => setTimeout(() => resolve(false), 1500)),
    ]);
  } catch {
    beta = false;
  }
  res.status(200).json({ user, beta: !!beta });
};
