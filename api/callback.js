const { API, DAYS, sessionCookie, shortCookie, clearCookie, parseCookies } = require('./_lib/session');
const { bot, createInvite } = require('./_lib/discord');

module.exports = async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.redirect(302, '/verify');
  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies.oauth_state) return res.status(400).send('Invalid request.');

  const tokenRes = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.SITE_URL}/api/callback`,
    }),
  });
  if (!tokenRes.ok) return res.status(400).send('Verification failed.');
  const tok = await tokenRes.json();

  const user = await (await fetch(`${API}/users/@me`, {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  })).json();
  if (!user.id || !/^\d+$/.test(user.id)) return res.status(400).send('Verification failed.');

  // Automatisch dem Hauptserver beitreten (guilds.join). Fallback: einmalige Einladung.
  let invite = null;
  const main = process.env.MAIN_GUILD_ID;
  if (main) {
    try {
      const j = await bot(`/guilds/${main}/members/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ access_token: tok.access_token }),
      });
      if (j.status !== 201 && j.status !== 204) invite = await createInvite(main);
    } catch { invite = await createInvite(main); }
  }

  const session = {
    id: user.id,
    name: user.global_name || user.username,
    avatar: user.avatar,
    at: tok.access_token,
    rt: tok.refresh_token,
    te: Date.now() + tok.expires_in * 1000,
    exp: Date.now() + DAYS * 24 * 3600 * 1000,
  };

  res.setHeader('Set-Cookie', [sessionCookie(session), clearCookie('oauth_state')]);
  res.redirect(302, `/${user.id}/guilds${invite ? `?invite=${encodeURIComponent(invite)}` : ''}`);
};
