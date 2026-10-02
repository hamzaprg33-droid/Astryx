const API = 'https://discord.com/api/v10';
const MAIN_GUILD_ID = '1555120089139773572';
const ADMINISTRATOR = 0x8n;
const CACHE_MS = 20_000;
const SNOWFLAKE = /^\d{15,21}$/;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function discord(path, { token, method = 'GET', body } = {}) {
  const headers = { Authorization: token ? `Bearer ${token}` : `Bot ${process.env.DISCORD_BOT_TOKEN}` };
  if (body) headers['Content-Type'] = 'application/json';
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (r.status !== 429 || attempt >= 2) return r;
    const info = await r.json().catch(() => ({}));
    await sleep(Math.min((info.retry_after || 1) * 1000, 4000));
  }
}

class DiscordError extends Error {
  constructor(status) { super(`Discord API ${status}`); this.status = status; }
}

// Short-lived per-instance caches soften Discord's strict rate limit on /users/@me/guilds.
const userGuildCache = new Map();
let botGuildCache = null;

async function manageableGuilds(session, fresh = false) {
  const hit = userGuildCache.get(session.id);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const r = await discord('/users/@me/guilds', { token: session.at });
  if (!r.ok) throw new DiscordError(r.status);
  const data = (await r.json()).filter(g => g.owner || (BigInt(g.permissions) & ADMINISTRATOR) === ADMINISTRATOR);
  userGuildCache.set(session.id, { at: Date.now(), data });
  return data;
}

async function botGuildIds(fresh = false) {
  if (!fresh && botGuildCache && Date.now() - botGuildCache.at < CACHE_MS) return botGuildCache.ids;
  const ids = new Set();
  let after = '0';
  for (;;) {
    const r = await discord(`/users/@me/guilds?limit=200&after=${after}`);
    if (!r.ok) throw new DiscordError(r.status);
    const page = await r.json();
    page.forEach(g => ids.add(g.id));
    if (page.length < 200) break;
    after = page[page.length - 1].id;
  }
  botGuildCache = { at: Date.now(), ids };
  return ids;
}

async function fetchBotGuild(guildId) {
  const r = await discord(`/guilds/${guildId}?with_counts=true`);
  return r.ok ? r.json() : null;
}

async function joinMainGuild(userId, accessToken) {
  const r = await discord(`/guilds/${MAIN_GUILD_ID}/members/${userId}`, { method: 'PUT', body: { access_token: accessToken } });
  if (r.status === 201 || r.status === 204) return { joined: true };

  const ch = await discord(`/guilds/${MAIN_GUILD_ID}/channels`);
  if (!ch.ok) return { joined: false };
  const textChannels = (await ch.json()).filter(c => c.type === 0).sort((a, b) => a.position - b.position);
  for (const c of textChannels) {
    const inv = await discord(`/channels/${c.id}/invites`, { method: 'POST', body: { max_age: 86400, max_uses: 1, unique: true } });
    if (inv.ok) return { joined: false, invite: `https://discord.gg/${(await inv.json()).code}` };
  }
  return { joined: false };
}

async function sendDM(userId, embed) {
  try {
    const ch = await discord('/users/@me/channels', { method: 'POST', body: { recipient_id: userId } });
    if (!ch.ok) return false;
    const { id } = await ch.json();
    return (await discord(`/channels/${id}/messages`, { method: 'POST', body: { embeds: [embed] } })).ok;
  } catch {
    return false;
  }
}

module.exports = { MAIN_GUILD_ID, SNOWFLAKE, DiscordError, sleep, manageableGuilds, botGuildIds, fetchBotGuild, joinMainGuild, sendDM };
