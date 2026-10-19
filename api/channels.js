const { guildAccess } = require('./_lib/access');
const { bot } = require('./_lib/discord');

// Alle Text-/Ankündigungskanäle des Servers
module.exports = async (req, res) => {
  const a = await guildAccess(req, res);
  if (!a) return;
  try {
    const r = await bot(`/guilds/${a.gid}/channels`);
    if (!r.ok) return res.status(404).json({ error: 'no_bot' });
    const all = await r.json();
    const cats = Object.fromEntries(all.filter(c => c.type === 4).map(c => [c.id, c.name]));
    const channels = all
      .filter(c => c.type === 0 || c.type === 5)
      .sort((x, y) => x.position - y.position)
      .map(c => ({ id: c.id, name: c.name, category: cats[c.parent_id] || null }));
    res.json({ channels });
  } catch { res.status(502).json({ error: 'discord' }); }
};
