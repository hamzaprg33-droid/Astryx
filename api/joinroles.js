const { guildAccess } = require('./_lib/access');
const { bot } = require('./_lib/discord');
const { readGuild, updateGuild } = require('./_lib/guilddata');
const { loadRoles } = require('./_lib/roles');

const MAX_ROLES = 10;
const MAX_TIMER = 600;   // Sekunden zwischen zwei Rollen

function validate(b) {
  if (!b || typeof b !== 'object') return null;
  if (!Array.isArray(b.roles) || b.roles.length > MAX_ROLES) return null;
  if (!b.roles.every(r => typeof r === 'string' && /^\d+$/.test(r)) || new Set(b.roles).size !== b.roles.length) return null;
  const timer = Number(b.timer);
  if (!Number.isInteger(timer) || timer < 0 || timer > MAX_TIMER) return null;
  const botRole = typeof b.botRole === 'string' ? b.botRole : '';
  if (botRole && !/^\d+$/.test(botRole)) return null;
  return { enabled: b.enabled === true, roles: b.roles, timer, applyToBots: b.applyToBots === true, botRole };
}

// Keine Zugangsdaten in Fehlermeldungen
const safe = (s) => {
  const token = process.env.GITHUB_TOKEN || '';
  let t = String(s || '');
  if (token.trim()) t = t.split(token.trim()).join('***');
  return t.replace(/(gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, '***').slice(0, 500);
};

module.exports = async (req, res) => {
  const a = await guildAccess(req, res);
  if (!a) return;

  try {
    if (req.method === 'GET') {
      // Alles gleichzeitig: Servername, Rollen, gespeicherte Einstellungen
      const [grS, rolesS, gS] = await Promise.allSettled([bot(`/guilds/${a.gid}`), loadRoles(a.gid), readGuild(a.gid)]);
      if (grS.status === 'rejected' || rolesS.status === 'rejected') throw (grS.reason || rolesS.reason);
      if (!grS.value.ok || !rolesS.value) return res.status(404).json({ error: 'no_bot' });
      if (gS.status === 'rejected') throw gS.reason;
      const guild = await grS.value.json();
      return res.json({ guild: { id: guild.id, name: guild.name }, roles: rolesS.value, config: (gS.value && gS.value.data && gS.value.data.joinroles) || null });
    }

    if (req.method === 'POST') {
      const origin = req.headers.origin;
      if (origin && origin !== process.env.SITE_URL) return res.status(403).json({ error: 'forbidden' });

      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
      const cfg = validate(body);
      if (!cfg) return res.status(400).json({ error: 'invalid' });

      if (cfg.enabled) {
        if (!cfg.roles.length && !cfg.botRole) return res.status(400).json({ error: 'roles_required' });
        if (cfg.roles.length >= 2 && cfg.timer < 1) return res.status(400).json({ error: 'timer_required' });   // Pflicht bei mehreren Rollen
      }

      const [gr, roles] = await Promise.all([bot(`/guilds/${a.gid}`), loadRoles(a.gid)]);
      if (!gr.ok || !roles) return res.status(404).json({ error: 'no_bot' });
      const byId = Object.fromEntries(roles.map(r => [r.id, r]));
      for (const id of [...cfg.roles, ...(cfg.botRole ? [cfg.botRole] : [])]) {
        if (!byId[id]) return res.status(400).json({ error: 'role_unknown' });
        if (!byId[id].assignable) return res.status(400).json({ error: 'role_unassignable', role: byId[id].name });
      }

      await updateGuild(a.gid, (await gr.json()).name, (d) => { d.joinroles = cfg; });
      return res.json({ ok: true, config: cfg });
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'method' });
  } catch (e) {
    const detail = safe(e.detail || (e.code ? '' : `${e.name}: ${e.message}`));
    console.error('joinroles api:', e.code || e.name, e.status || '', detail);
    if (e.code === 'no_db' || e.code === 'db_auth') return res.status(503).json({ error: e.code, detail });
    if (e.code === 'bad_json') return res.status(422).json({ error: 'bad_json' });
    res.status(502).json({ error: 'server', detail });
  }
};
