const { API, refreshSession } = require('./session');

const bot = (path, init = {}) =>
  fetch(API + path, {
    ...init,
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

const asUser = (path, token) => fetch(API + path, { headers: { Authorization: `Bearer ${token}` } });

// Verwalten dürfen nur Inhaber oder Mitglieder mit Administrator-Recht (0x8).
const isManageable = (g) => g.owner === true || (BigInt(g.permissions || '0') & 0x8n) !== 0n;
const roleOf = (g) => (g.owner ? 'owner' : 'admin');

// Server des Users abrufen. Bei 401 wird der Token einmal erneuert und die Abfrage wiederholt.
// Wirft Fehler mit .code = 'token' (Login nicht mehr gültig) oder 'discord' (andere Störung).
async function manageableGuilds(res, session) {
  let s = session;
  let r = await asUser('/users/@me/guilds', s.at);
  if (r.status === 401) {
    const n = await refreshSession(res, s);
    if (!n) { const e = new Error('token'); e.code = 'token'; throw e; }
    s = n;
    r = await asUser('/users/@me/guilds', s.at);
  }
  if (!r.ok) { const e = new Error('guilds'); e.code = r.status === 401 ? 'token' : 'discord'; throw e; }
  return (await r.json()).filter(isManageable);
}

async function botInGuild(guildId) {
  try { return (await bot(`/guilds/${guildId}`)).ok; } catch { return false; }
}

// Einladung (1 Nutzung, 10 Minuten) in irgendeinen Textkanal erstellen.
async function createInvite(guildId) {
  try {
    const cr = await bot(`/guilds/${guildId}/channels`);
    if (!cr.ok) return null;
    const channels = (await cr.json()).filter(c => c.type === 0).sort((a, b) => a.position - b.position);
    for (const ch of channels) {
      const ir = await bot(`/channels/${ch.id}/invites`, {
        method: 'POST',
        body: JSON.stringify({ max_age: 600, max_uses: 1, unique: true }),
      });
      if (ir.ok) return (await ir.json()).code;
    }
  } catch { /* ignorieren */ }
  return null;
}

module.exports = { bot, asUser, isManageable, roleOf, manageableGuilds, botInGuild, createInvite };
