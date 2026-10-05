const { getFreshSession } = require('./_lib/session');
const { manageableGuilds, botInGuild, roleOf } = require('./_lib/discord');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const s = await getFreshSession(req, res);
  if (!s) return res.status(401).json({ error: 'no_session' });
  // Nur der eingeloggte User darf seine eigene Liste sehen
  if (req.query.uid !== s.id) return res.status(403).json({ error: 'forbidden' });

  try {
    const mine = (await manageableGuilds(res, s)).slice(0, 100);
    const hasBot = await Promise.all(mine.map(g => botInGuild(g.id)));
    res.json({
      guilds: mine.map((g, i) => ({ id: g.id, name: g.name, icon: g.icon, role: roleOf(g), hasBot: hasBot[i] })),
    });
  } catch (e) {
    if (e.code === 'token') return res.status(401).json({ error: 'token' });
    res.status(502).json({ error: 'discord' });
  }
};
