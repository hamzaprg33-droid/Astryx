const { guildAccess } = require('./_lib/access');
const { bot } = require('./_lib/discord');

module.exports = async (req, res) => {
  const a = await guildAccess(req, res);
  if (!a) return;
  try {
    const r = await bot(`/guilds/${a.gid}?with_counts=true`);
    if (!r.ok) return res.status(404).json({ error: 'no_bot' });
    const g = await r.json();
    res.json({ id: g.id, name: g.name, icon: g.icon, members: g.approximate_member_count ?? null });
  } catch {
    res.status(502).json({ error: 'discord' });
  }
};
