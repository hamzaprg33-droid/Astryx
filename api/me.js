const { readSession } = require('./_lib/session');
const { userHasBeta } = require('./_lib/beta');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const s = readSession(req);
  if (!s) return res.status(401).json({ user: null });

  const user = { id: s.id, name: s.name, avatar: s.avatar };
  let beta = false;
  try {
    beta = await userHasBeta(s.id);
  } catch {
    beta = false;
  }
  res.status(200).json({ user, beta: !!beta });
};
