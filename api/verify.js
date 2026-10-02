const crypto = require('crypto');

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: `${process.env.SITE_URL}/api/callback`,
    response_type: 'code',
    scope: 'identify guilds',
    state,
  });
  res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.redirect(302, `https://discord.com/oauth2/authorize?${params}`);
};
