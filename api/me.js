const { getSession } = require('./_lib/session');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const s = await getSession(req, res);
  if (!s) return res.status(401).json({ user: null });
  res.json({ user: { id: s.id, name: s.name, avatar: s.avatar } });
};
