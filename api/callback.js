const { createToken, readToken, parseCookies } = require('./_lib/session');

const DAYS = 30;

async function sendWelcomeDM(userId) {
  try {
    const headers = { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' };
    const ch = await fetch('https://discord.com/api/users/@me/channels', {
      method: 'POST', headers, body: JSON.stringify({ recipient_id: userId }),
    });
    if (!ch.ok) return;
    const { id } = await ch.json();
    await fetch(`https://discord.com/api/channels/${id}/messages`, {
      method: 'POST', headers,
      body: JSON.stringify({
        embeds: [{
          title: '✨ Willkommen bei Astryx',
          description: 'Du bist jetzt verifiziert. Nutze `/help`, um alle Commands zu sehen.',
          color: 0x00e5ff,
        }],
      }),
    });
  } catch { /* DMs können blockiert sein – kein Problem */ }
}

module.exports = async (req, res) => {
  const { code, state } = req.query;
  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies.oauth_state) return res.status(400).send('Ungültige Anfrage.');

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
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
  if (!tokenRes.ok) return res.status(400).send('Verifizierung fehlgeschlagen.');
  const { access_token } = await tokenRes.json();

  const user = await (await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })).json();

  // Willkommens-DM nur beim ersten Mal
  const existing = readToken(cookies.session);
  if (!existing || existing.exp < Date.now()) await sendWelcomeDM(user.id);

  const session = createToken({
    id: user.id,
    name: user.global_name || user.username,
    avatar: user.avatar,
    exp: Date.now() + DAYS * 24 * 3600 * 1000,
  });

  res.setHeader('Set-Cookie', [
    `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${DAYS * 24 * 3600}`,
    'oauth_state=; Path=/; Max-Age=0',
  ]);
  res.redirect(302, '/');
};
