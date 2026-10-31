// Zentrale Beta-Prüfung (Rolle auf dem Main-Server).
// Robuster: getrimmte IDs, Fallback-Guild, optional Rollenname "beta_permissions".

const MAIN_GUILD = String(
  process.env.BETA_MAIN_GUILD ||
  process.env.MAIN_GUILD_ID ||
  '1555120089139773572'
).trim();

const BETA_ROLE = String(
  process.env.BETA_ROLE_ID ||
  '1564767142136516689'
).trim();

const BETA_ROLE_NAME = String(
  process.env.BETA_ROLE_NAME ||
  'beta_permissions'
).trim().toLowerCase();

const betaCache = new Map();
const TTL_YES = 60 * 1000;
const TTL_NO  = 15 * 1000;

async function botFetch(path) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error('DISCORD_BOT_TOKEN fehlt');
  return fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${token}` },
  });
}

async function userHasBeta(userId) {
  const hit = betaCache.get(userId);
  if (hit) {
    const ttl = hit.has ? TTL_YES : TTL_NO;
    if (Date.now() - hit.at < ttl) return hit.has;
  }

  try {
    const r = await botFetch(`/guilds/${MAIN_GUILD}/members/${encodeURIComponent(userId)}`);
    if (!r.ok) {
      console.error('beta: Discord', r.status, 'user', userId, 'guild', MAIN_GUILD);
      betaCache.set(userId, { at: Date.now(), has: false });
      return false;
    }
    const m = await r.json();
    const roles = Array.isArray(m.roles) ? m.roles.map(String) : [];

    // 1) Exakte Rollen-ID
    if (BETA_ROLE && roles.includes(BETA_ROLE)) {
      betaCache.set(userId, { at: Date.now(), has: true });
      return true;
    }

    // 2) Fallback: Rolle anhand des Namens (beta_permissions)
    if (BETA_ROLE_NAME) {
      const rr = await botFetch(`/guilds/${MAIN_GUILD}/roles`);
      if (rr.ok) {
        const all = await rr.json();
        const hitRole = (Array.isArray(all) ? all : []).find(x =>
          x && String(x.name || '').trim().toLowerCase() === BETA_ROLE_NAME
        );
        if (hitRole && roles.includes(String(hitRole.id))) {
          console.log('beta: erkannt über Rollenname', BETA_ROLE_NAME, '→', hitRole.id);
          betaCache.set(userId, { at: Date.now(), has: true });
          return true;
        }
      }
    }

    betaCache.set(userId, { at: Date.now(), has: false });
    return false;
  } catch (e) {
    console.error('beta: Fehler', e && e.message);
    return false;
  }
}

module.exports = { userHasBeta, MAIN_GUILD, BETA_ROLE };
