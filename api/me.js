const { readSession } = require('./_lib/session');

const MAIN_GUILD = process.env.BETA_MAIN_GUILD || '1565293644171186227';
const BETA_ROLE = process.env.BETA_ROLE_ID || '1564767142136516689';

const betaCache = new Map();
const BETA_TTL_YES = 60 * 1000;  // 1 Min
const BETA_TTL_NO  = 15 * 1000;  // 15 Sek

async function hasBeta(userId) {
  const hit = betaCache.get(userId);
  if (hit) {
    const ttl = hit.has ? BETA_TTL_YES : BETA_TTL_NO;
    if (Date.now() - hit.at < ttl) return hit.has;
  }
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error('me/beta: DISCORD_BOT_TOKEN fehlt');
      return false;
    }
    const r = await fetch(
      `https://discord.com/api/v10/guilds/${MAIN_GUILD}/members/${userId}`,
      { headers: { Authorization: `Bot ${token}` } }
    );
    if (!r.ok) {
      // 404 = nicht auf dem Main-Server
      console.error('me/beta: Discord', r.status, 'user', userId);
      betaCache.set(userId, { at: Date.now(), has: false });
      return false;
    }
    const m = await r.json();
    const roles = Array.isArray(m.roles) ? m.roles.map(String) : [];
    const has = roles.includes(String(BETA_ROLE));
    betaCache.set(userId, { at: Date.now(), has });
    return has;
  } catch (e) {
    console.error('me/beta: Fehler', e && e.message);
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
    beta = await hasBeta(s.id);
  } catch {
    beta = false;
  }
  res.status(200).json({ user, beta: !!beta });
};
