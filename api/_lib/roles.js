const { bot } = require('./discord');

// Rollen des Servers + Info, welche davon der Bot überhaupt vergeben darf
// (nicht von Integrationen verwaltet UND unterhalb der höchsten Bot-Rolle)
async function loadRoles(gid) {
  const botId = (process.env.DISCORD_CLIENT_ID || '').trim();
  const [rr, mr] = await Promise.all([
    bot(`/guilds/${gid}/roles`),
    botId ? bot(`/guilds/${gid}/members/${botId}`) : Promise.resolve(null),
  ]);
  if (!rr.ok) return null;
  const all = await rr.json();
  let top = Infinity;   // Bot-Mitglied nicht lesbar -> Rangfolge nicht vorab prüfen
  if (mr && mr.ok) {
    const mine = new Set(((await mr.json()).roles) || []);
    top = all.filter(r => mine.has(r.id)).reduce((m, r) => Math.max(m, r.position), 0);
  }
  return all.filter(r => r.id !== gid)   // @everyone ausblenden
    .map(r => ({
      id: r.id, name: r.name, color: r.color, position: r.position,
      assignable: !r.managed && r.position < top,
      reason: r.managed ? 'managed' : (r.position >= top ? 'hierarchy' : null),
    }))
    .sort((a, b) => b.position - a.position);
}

module.exports = { loadRoles };
