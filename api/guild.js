const { getFreshSession } = require('./_lib/session');
const { manageableGuilds, bot } = require('./_lib/discord');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { uid, gid } = req.query;
  const s = await getFreshSession(req, res);
  if (!s) return res.status(401).json({ error: 'unauthorized' });
  if (uid !== s.id || !/^\d+$/.test(gid || '')) return res.status(403).json({ error: 'forbidden' });

  try {
    const mine = await manageableGuilds(s.at);
    if (!mine.some(g => g.id === gid)) return res.status(403).json({ error: 'forbidden' });
    const r = await bot(`/guilds/${gid}?with_counts=true`);
    if (!r.ok) return res.status(404).json({ error: 'no_bot' });
    const g = await r.json();
    res.json({ id: g.id, name: g.name, icon: g.icon, members: g.approximate_member_count ?? null });
  } catch {
    res.status(502).json({ error: 'discord' });
  }
};
