const crypto = require('crypto');
const { getSession, appendCookie } = require('./_lib/session');
const { manageableGuilds, SNOWFLAKE } = require('./_lib/discord');
const { getLang, strings } = require('./_lib/i18n');
const resultPage = require('./_lib/result-page');

module.exports = async (req, res) => {
  const lang = getLang(req);
  const T = strings(lang);
  const guildId = String(req.query.guild || '');
  if (!SNOWFLAKE.test(guildId)) return resultPage(res, { lang, kind: 'invite', ok: false, messages: [T.invalid], status: 400 });

  const session = await getSession(req, res);
  if (!session) return res.redirect(302, '/verify');

  let guilds;
  try {
    guilds = await manageableGuilds(session);
  } catch (e) {
    return resultPage(res, { lang, kind: 'invite', ok: false, messages: [e.status === 429 ? T.rateLimited : T.invalid], status: 502 });
  }
  if (!guilds.some(g => g.id === guildId)) {
    return resultPage(res, { lang, kind: 'invite', ok: false, messages: [T.forbidden], status: 403 });
  }

  const state = `i.${crypto.randomBytes(16).toString('hex')}.${guildId}`;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    scope: 'bot applications.commands',
    permissions: '8',
    guild_id: guildId,
    disable_guild_select: 'true',
    response_type: 'code',
    redirect_uri: `${process.env.SITE_URL}/api/callback`,
    state,
  });
  appendCookie(res, `invite_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.redirect(302, `https://discord.com/oauth2/authorize?${params}`);
};
