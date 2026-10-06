const { getSession } = require('./_lib/session');
const { manageableGuilds, botGuildIds } = require('./_lib/discord');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const session = await getSession(req, res);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const fresh = req.query.fresh === '1';
  try {
    // A broken bot token must not log the user out, so bot lookup errors are reported separately.
    const [guilds, botResult] = await Promise.all([
      manageableGuilds(session, fresh),
      botGuildIds(fresh).then(ids => ({ ids }), e => ({ ids: new Set(), error: e.status === 401 ? 'bot_token_invalid' : 'bot_lookup_failed' })),
    ]);
    if (botResult.error) console.error('[guilds] bot guild lookup failed:', botResult.error);
    const list = guilds
      .map(g => ({ id: g.id, name: g.name, icon: g.icon, role: g.owner ? 'owner' : 'admin', bot: botResult.ids.has(g.id) }))
      .sort((a, b) => (b.bot - a.bot) || a.name.localeCompare(b.name));
    res.json({ userId: session.id, guilds: list, botError: botResult.error || null });
  } catch (e) {
    if (e.status === 401) return res.status(401).json({ error: 'unauthorized' });
    res.status(e.status === 429 ? 429 : 502).json({ error: e.status === 429 ? 'rate_limited' : 'discord_error' });
  }
};
