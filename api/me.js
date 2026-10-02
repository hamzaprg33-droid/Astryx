const { readToken, parseCookies } = require('./_lib/session');

module.exports = (req, res) => {
  const s = readToken(parseCookies(req).session);
  if (!s || s.exp < Date.now()) return res.status(401).json({ user: null });
  res.json({ user: { id: s.id, name: s.name, avatar: s.avatar } });
};
