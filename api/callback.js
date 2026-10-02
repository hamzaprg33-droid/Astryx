const { createToken, readToken, parseCookies } = require('./_lib/session');
const resultPage = require('./_lib/result-page');

const DAYS = 30;
const botHeaders = () => ({ Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' });

// Discord erlaubt Bot-DMs nur an User, die mindestens einen Server mit dem Bot teilen.
// Bei einem Community-Bot ist das jeder Server, auf dem Astryx installiert ist.
async function sendWelcomeDM(userId) {
  try {
    const ch = await fetch('https://discord.com/api/users/@me/channels', {
      method: 'POST', headers: botHeaders(), body: JSON.stringify({ recipient_id: userId }),
    });
    if (!ch.ok) return;
    const { id } = await ch.json();
    await fetch(`https://discord.com/api/channels/${id}/messages`, {
      method: 'POST', headers: botHeaders(),
      body: JSON.stringify({
        embeds: [{
          title: '✨ Willkommen bei Astryx',
          description: 'Du bist jetzt verifiziert. Nutze `/help`, um alle Commands zu sehen.',
          color: 0x00e5ff,
        }],
      }),
    });
  } catch { /* DMs können in den Privatsphäre-Einstellungen blockiert sein */ }
}

module.exports = async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return resultPage(res, { ok: false, message: 'Autorisierung abgebrochen.', status: 400 });

  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies.oauth_state) {
    return resultPage(res, { ok: false, message: 'Ungültige Anfrage. Bitte versuche es erneut.', status: 400 });
  }

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
  if (!tokenRes.ok) return resultPage(res, { ok: false, message: 'Verifizierung fehlgeschlagen.', status: 400 });
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
  resultPage(res, { ok: true, message: 'Du bist jetzt verifiziert.' });
};
