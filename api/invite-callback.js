const { readSession, parseCookies, clearCookie } = require('./_lib/session');

module.exports = (req, res) => {
  const { state, guild_id } = req.query;
  const s = readSession(req);
  if (!s) return res.redirect(302, '/verify');
  const ok = state && state === parseCookies(req).invite_state;
  res.setHeader('Set-Cookie', clearCookie('invite_state'));
  const added = ok && /^\d+$/.test(guild_id || '') ? `?added=${guild_id}` : '';
  res.redirect(302, `/${s.id}/guilds${added}`);
};
