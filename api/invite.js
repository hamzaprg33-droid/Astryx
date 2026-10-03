const crypto = require('crypto');
const { getFreshSession, shortCookie } = require('./_lib/session');
const { manageableGuilds } = require('./_lib/discord');

// Bot auf einen Server einladen (Administrator-Rechte, Server vorausgewählt)
module.exports = async (req, res) => {
  const gid = req.query.gid;
  const s = await getFreshSession(req, res);
  if (!s) return res.redirect(302, '/verify');
  if (!/^\d+$/.test(gid || '')) return res.status(400).send('Invalid request.');

  try {
    const mine = await manageableGuilds(s.at);
    if (!mine.some(g => g.id === gid)) return res.status(403).send('Forbidden.');
  } catch { return res.status(502).send('Discord error.'); }

  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    scope: 'bot applications.commands',
    permissions: '8',
    guild_id: gid,
    disable_guild_select: 'true',
    response_type: 'code',
    redirect_uri: `${process.env.SITE_URL}/api/invite-callback`,
    state,
  });
  // Set-Cookie wurde ggf. schon durch Token-Refresh gesetzt -> anhängen statt überschreiben
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(prev ? [].concat(prev) : []), shortCookie('invite_state', state)]);
  res.redirect(302, `https://discord.com/oauth2/authorize?${params}`);
};
