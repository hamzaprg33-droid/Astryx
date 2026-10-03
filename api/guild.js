const { getSession } = require('./_lib/session');
const { manageableGuilds, fetchBotGuild, SNOWFLAKE } = require('./_lib/discord');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const id = String(req.query.id || '');
  if (!SNOWFLAKE.test(id)) return res.status(400).json({ error: 'invalid' });

  const session = await getSession(req, res);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  try {
    const entry = (await manageableGuilds(session)).find(g => g.id === id);
    if (!entry) return res.status(403).json({ error: 'forbidden' });

    const guild = await fetchBotGuild(id);
    if (!guild) return res.status(404).json({ error: 'bot_missing', id, name: entry.name, icon: entry.icon });

    res.json({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      role: entry.owner ? 'owner' : 'admin',
      members: guild.approximate_member_count ?? null,
      online: guild.approximate_presence_count ?? null,
    });
  } catch (e) {
    res.status(e.status === 429 ? 429 : 502).json({ error: e.status === 429 ? 'rate_limited' : 'discord_error' });
  }
};
