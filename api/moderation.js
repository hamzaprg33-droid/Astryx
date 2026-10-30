const { guildAccess } = require('./_lib/access');
const { bot } = require('./_lib/discord');
const { readGuild, updateGuild } = require('./_lib/guilddata');

const REASON = new Set(['required', 'optional', 'none']);
const WHO = new Set(['standard', 'team', 'leadership', 'high']);
const MSG_TYPE = new Set(['dm', 'channel']);
const HEX = /^#[0-9a-fA-F]{6}$/;
const str = (v, max) => typeof v === 'string' && v.length <= max;

function validateMsg(m) {
  if (!m || typeof m !== 'object') return null;
  const e = m.embed || {};
  const out = {
    type: MSG_TYPE.has(m.type) ? m.type : 'dm',
    textEnabled: m.textEnabled === true,
    text: typeof m.text === 'string' ? m.text : '',
    embedEnabled: m.embedEnabled === true,
    embed: {
      title: typeof e.title === 'string' ? e.title : '',
      description: typeof e.description === 'string' ? e.description : '',
      color: typeof e.color === 'string' && HEX.test(e.color) ? e.color : '#E74C3C',
    },
  };
  if (!str(out.text, 2000) || !str(out.embed.title, 256) || !str(out.embed.description, 4000)) return null;
  return out;
}

function validateCmd(c, isBan) {
  if (!c || typeof c !== 'object') return null;
  const who = Array.isArray(c.who) ? c.who.filter(w => WHO.has(w)) : [];
  const messages = Array.isArray(c.messages) ? c.messages.slice(0, 2).map(validateMsg).filter(Boolean) : [];
  const out = {
    enabled: c.enabled === true,
    reason: REASON.has(c.reason) ? c.reason : 'optional',
    who,
    messages,
  };
  if (isBan) {
    out.minDuration = Math.max(0, Math.min(525600, parseInt(c.minDuration, 10) || 0)); // max 1 year
    out.maxDuration = Math.max(0, Math.min(525600, parseInt(c.maxDuration, 10) || 0));
    out.permanent = c.permanent !== false;
  }
  return out;
}

function validate(b) {
  if (!b || typeof b !== 'object') return null;
  const out = {
    enabled: b.enabled === true,
    teamRoles: Array.isArray(b.teamRoles) ? b.teamRoles.filter(id => /^\d+$/.test(id)).slice(0, 25) : [],
    leadershipRoles: Array.isArray(b.leadershipRoles) ? b.leadershipRoles.filter(id => /^\d+$/.test(id)).slice(0, 25) : [],
    dashboardRoles: Array.isArray(b.dashboardRoles) ? b.dashboardRoles.filter(id => /^\d+$/.test(id)).slice(0, 25) : [],
    standardTeamRole: typeof b.standardTeamRole === 'string' && /^\d+$/.test(b.standardTeamRole) ? b.standardTeamRole : '',
    commands: {
      warn: validateCmd(b.commands && b.commands.warn, false) || validateCmd({}, false),
      kick: validateCmd(b.commands && b.commands.kick, false) || validateCmd({}, false),
      ban: validateCmd(b.commands && b.commands.ban, true) || validateCmd({}, true),
    },
  };
  return out;
}

const safe = (s) => {
  const token = process.env.GITHUB_TOKEN || '';
  let t = String(s || '');
  if (token.trim()) t = t.split(token.trim()).join('***');
  return t.replace(/(gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, '***').slice(0, 500);
};

// Slash-Command-Definitionen
function buildCommands(cfg) {
  const cmds = [];
  if (!cfg || !cfg.enabled) return cmds;

  const reasonOpt = (req) => ({
    name: 'grund',
    description: 'Grund für die Maßnahme',
    type: 3, // STRING
    required: req === 'required',
  });

  if (cfg.commands.warn && cfg.commands.warn.enabled) {
    const opts = [
      { name: 'user', description: 'Nutzer, der verwarnt wird', type: 6, required: true },
    ];
    if (cfg.commands.warn.reason !== 'none') opts.push(reasonOpt(cfg.commands.warn.reason));
    cmds.push({ name: 'warn', description: 'Verwarnt einen Nutzer', options: opts });
  }
  if (cfg.commands.kick && cfg.commands.kick.enabled) {
    const opts = [
      { name: 'user', description: 'Nutzer, der gekickt wird', type: 6, required: true },
    ];
    if (cfg.commands.kick.reason !== 'none') opts.push(reasonOpt(cfg.commands.kick.reason));
    cmds.push({ name: 'kick', description: 'Kickt einen Nutzer vom Server', options: opts });
  }
  if (cfg.commands.ban && cfg.commands.ban.enabled) {
    const opts = [
      { name: 'user', description: 'Nutzer, der gebannt wird', type: 6, required: true },
      { name: 'zeit', description: 'Dauer (z. B. 30m, 12h, 7d) – leer = permanent falls erlaubt', type: 3, required: false },
    ];
    if (cfg.commands.ban.reason !== 'none') opts.push(reasonOpt(cfg.commands.ban.reason));
    cmds.push({ name: 'ban', description: 'Bannt einen Nutzer', options: opts });
  }
  return cmds;
}

async function registerGuildCommands(gid, cfg) {
  const appId = process.env.DISCORD_CLIENT_ID;
  if (!appId) throw new Error('DISCORD_CLIENT_ID fehlt');
  const body = buildCommands(cfg);
  // Zuerst bestehende Commands des Bots auf diesem Server lesen und löschen (nur unsere)
  const listR = await bot(`/applications/${appId}/guilds/${gid}/commands`);
  if (listR.ok) {
    const existing = await listR.json();
    const ours = new Set(['warn', 'kick', 'ban']);
    for (const c of existing) {
      if (ours.has(c.name)) {
        await bot(`/applications/${appId}/guilds/${gid}/commands/${c.id}`, { method: 'DELETE' });
      }
    }
  }
  // Neu setzen
  const r = await bot(`/applications/${appId}/guilds/${gid}/commands`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`Discord ${r.status}: ${t.slice(0, 200)}`);
  }
  return body.map(c => c.name);
}

module.exports = async (req, res) => {
  const a = await guildAccess(req, res);
  if (!a) return;

  try {
    // Rollen + Owner/Admin-Status + Config
    if (req.method === 'GET') {
      const [grS, rrS, gS] = await Promise.allSettled([
        bot(`/guilds/${a.gid}`),
        bot(`/guilds/${a.gid}/roles`),
        readGuild(a.gid),
      ]);
      if (grS.status === 'rejected' || rrS.status === 'rejected') throw (grS.reason || rrS.reason);
      if (!grS.value.ok || !rrS.value.ok) return res.status(404).json({ error: 'no_bot' });
      if (gS.status === 'rejected') throw gS.reason;

      const guild = await grS.value.json();
      const allRoles = await rrS.value.json();
      // Bot-Rolle finden (höchstes Position der Rollen des Bots)
      const botMemberR = await bot(`/guilds/${a.gid}/members/${process.env.DISCORD_CLIENT_ID}`);
      let botTop = 0;
      if (botMemberR.ok) {
        const bm = await botMemberR.json();
        const botRoleIds = new Set(bm.roles || []);
        for (const r of allRoles) if (botRoleIds.has(r.id) && r.position > botTop) botTop = r.position;
      }
      const roles = allRoles
        .filter(r => r.id !== a.gid) // @everyone raus
        .sort((x, y) => y.position - x.position)
        .map(r => ({
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position,
          assignable: !r.managed && r.position < botTop,
          reason: r.managed ? 'managed' : (r.position >= botTop ? 'hierarchy' : null),
        }));

      // Ist der aktuelle User Owner oder Admin auf diesem Server?
      let isOwnerOrAdmin = false;
      try {
        if (guild.owner_id === a.s.id) isOwnerOrAdmin = true;
        else {
          const mr = await bot(`/guilds/${a.gid}/members/${a.s.id}`);
          if (mr.ok) {
            const mem = await mr.json();
            const adminBit = 0x8n;
            for (const rid of mem.roles || []) {
              const role = allRoles.find(x => x.id === rid);
              if (role && (BigInt(role.permissions || '0') & adminBit) !== 0n) { isOwnerOrAdmin = true; break; }
            }
          }
        }
      } catch { /* ignore */ }

      const g = gS.value;
      return res.json({
        guild: { id: guild.id, name: guild.name },
        roles,
        isOwnerOrAdmin,
        config: (g && g.data && g.data.moderation) || null,
      });
    }

    if (req.method === 'POST') {
      const origin = req.headers.origin;
      if (origin && origin !== process.env.SITE_URL) return res.status(403).json({ error: 'forbidden' });

      const action = req.query.action;

      // Commands registrieren
      if (action === 'register') {
        const g = await readGuild(a.gid);
        const cfg = (g && g.data && g.data.moderation) || null;
        if (!cfg || !cfg.enabled) return res.status(400).json({ error: 'not_enabled' });
        const names = await registerGuildCommands(a.gid, cfg);
        return res.json({ ok: true, commands: names });
      }

      // Config speichern
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
      const cfg = validate(body);
      if (!cfg) return res.status(400).json({ error: 'invalid' });

      // Dashboard-Rollen dürfen nur Owner/Admin ändern
      const gr = await bot(`/guilds/${a.gid}`);
      if (!gr.ok) return res.status(404).json({ error: 'no_bot' });
      const guild = await gr.json();
      let isOwnerOrAdmin = guild.owner_id === a.s.id;
      if (!isOwnerOrAdmin) {
        const rr = await bot(`/guilds/${a.gid}/roles`);
        const mr = await bot(`/guilds/${a.gid}/members/${a.s.id}`);
        if (rr.ok && mr.ok) {
          const allRoles = await rr.json();
          const mem = await mr.json();
          const adminBit = 0x8n;
          for (const rid of mem.roles || []) {
            const role = allRoles.find(x => x.id === rid);
            if (role && (BigInt(role.permissions || '0') & adminBit) !== 0n) { isOwnerOrAdmin = true; break; }
          }
        }
      }
      if (!isOwnerOrAdmin) {
        // Alte dashboardRoles beibehalten
        const prev = await readGuild(a.gid);
        const old = (prev && prev.data && prev.data.moderation && prev.data.moderation.dashboardRoles) || [];
        cfg.dashboardRoles = old;
      }

      await updateGuild(a.gid, guild.name, (d) => { d.moderation = cfg; });
      return res.json({ ok: true, config: cfg });
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'method' });
  } catch (e) {
    const detail = safe(e.detail || (e.code ? '' : `${e.name}: ${e.message}`));
    console.error('moderation api:', e.code || e.name, e.status || '', detail);
    if (e.code === 'no_db' || e.code === 'db_auth') return res.status(503).json({ error: e.code, detail });
    if (e.code === 'bad_json') return res.status(422).json({ error: 'bad_json' });
    res.status(502).json({ error: 'server', detail });
  }
};
