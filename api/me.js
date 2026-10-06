const { readSession } = require('./_lib/session');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const s = readSession(req);
  if (!s) return res.status(401).json({ user: null });
  res.json({ user: { id: s.id, name: s.name, avatar: s.avatar } });
};
