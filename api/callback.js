const { parseCookies, setSessionCookie, clearCookie, buildSession, getSession } = require('./_lib/session');
const { joinMainGuild, fetchBotGuild, sendDM, sleep } = require('./_lib/discord');
const { getLang, strings } = require('./_lib/i18n');
const resultPage = require('./_lib/result-page');

const DASHBOARD_URL = 'https://astryx-bot.vercel.app';
const escapeMarkdown = (s) => String(s).replace(/([*_`~|\\[\]])/g, '\\$1');

async function handleVerify(req, res, { lang, T, code, state, cookies }) {
  clearCookie(res, 'oauth_state');
  if (!code || state !== cookies.oauth_state) {
    return resultPage(res, { lang, ok: false, messages: [T.invalid], status: 400 });
  }

  const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
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
  if (!tokenRes.ok) return resultPage(res, { lang, ok: false, messages: [T.failed], status: 400 });
  const tokens = await tokenRes.json();

  const userRes = await fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!userRes.ok) return resultPage(res, { lang, ok: false, messages: [T.failed], status: 400 });
  const user = await userRes.json();

  const join = await joinMainGuild(user.id, tokens.access_token).catch(() => ({ joined: false }));
  setSessionCookie(res, buildSession(user, tokens));

  const messages = [T.verified];
  if (join.joined) messages.push(T.joinedMain);
  else if (join.invite) messages.push(T.joinFallback);

  resultPage(res, {
    lang,
    ok: true,
    messages,
    link: join.invite ? { href: join.invite, label: T.joinButton } : null,
    autoClose: !join.invite,
    next: `/${user.id}/guilds`,
    data: { userId: user.id },
  });
}

async function handleInvite(req, res, { lang, T, state, cookies, queryGuild }) {
  clearCookie(res, 'invite_state');
  const guildId = state.split('.')[2];
  if (state !== cookies.invite_state || (queryGuild && queryGuild !== guildId)) {
    return resultPage(res, { lang, kind: 'invite', ok: false, messages: [T.invalid], status: 400 });
  }

  const session = await getSession(req, res);
  if (!session) return res.redirect(302, '/verify');

  let guild = null;
  for (let i = 0; i < 4 && !guild; i++) {
    if (i) await sleep(1200);
    guild = await fetchBotGuild(guildId);
  }
  const next = `/${session.id}/guilds`;
  if (!guild) return resultPage(res, { lang, kind: 'invite', ok: false, messages: [T.botMissing], next, status: 404 });

  await sendDM(session.id, {
    title: T.dmTitle,
    description: T.dmBody(escapeMarkdown(guild.name), DASHBOARD_URL),
    color: 0x00e5ff,
    thumbnail: guild.icon ? { url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` } : undefined,
  });

  resultPage(res, {
    lang,
    kind: 'invite',
    ok: true,
    title: T.invitedTitle,
    messages: [T.invited.replace('{guild}', guild.name)],
    next,
    data: { guildId },
  });
}

module.exports = async (req, res) => {
  const lang = getLang(req);
  const T = strings(lang);
  const { code, state, error, guild_id: queryGuild } = req.query;
  const cookies = parseCookies(req);
  const isInvite = typeof state === 'string' && state.startsWith('i.');

  if (error) {
    clearCookie(res, isInvite ? 'invite_state' : 'oauth_state');
    return resultPage(res, { lang, kind: isInvite ? 'invite' : 'auth', ok: false, messages: [T.cancelled], status: 400 });
  }
  if (typeof state !== 'string') return resultPage(res, { lang, ok: false, messages: [T.invalid], status: 400 });

  try {
    if (isInvite) return await handleInvite(req, res, { lang, T, state, cookies, queryGuild });
    return await handleVerify(req, res, { lang, T, code, state, cookies });
  } catch {
    return resultPage(res, { lang, kind: isInvite ? 'invite' : 'auth', ok: false, messages: [T.failed], status: 500 });
  }
};
