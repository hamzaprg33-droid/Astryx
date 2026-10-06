const crypto = require('crypto');
const { shortCookie } = require('./_lib/session');

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: `${process.env.SITE_URL}/api/callback`,
    response_type: 'code',
    scope: 'identify guilds guilds.join',
    state,
  });
  res.setHeader('Set-Cookie', shortCookie('oauth_state', state));
  res.redirect(302, `https://discord.com/oauth2/authorize?${params}`);
};
