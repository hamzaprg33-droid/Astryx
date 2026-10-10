const { guildAccess } = require('./_lib/access');
const { bot } = require('./_lib/discord');
const { readGuild, updateGuild } = require('./_lib/guilddata');

const HEX = /^#[0-9a-fA-F]{6}$/;
const str = (v, max) => typeof v === 'string' && v.length <= max;

function validate(b) {
  if (!b || typeof b !== 'object') return null;
  const e = b.embed || {};
  const out = {
    enabled: b.enabled === true,
    channelId: typeof b.channelId === 'string' ? b.channelId : '',
    textEnabled: b.textEnabled === true,
    text: b.text,
    embedEnabled: b.embedEnabled === true,
    embed: { title: e.title, description: e.description, color: e.color },
  };
  if (!str(out.text, 2000) || !str(out.embed.title, 256) || !str(out.embed.description, 4000)) return null;
  if (typeof out.embed.color !== 'string' || !HEX.test(out.embed.color)) return null;
  if (out.channelId && !/^\d+$/.test(out.channelId)) return null;
  return out;
}

// Keine Zugangsdaten in Fehlermeldungen
const safe = (s) => {
  const token = process.env.GITHUB_TOKEN || '';
  let t = String(s || '');
  if (token.trim()) t = t.split(token.trim()).join('***');
  return t.replace(/(gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, '***').slice(0, 200);
};

module.exports = async (req, res) => {
  const a = await guildAccess(req, res);
  if (!a) return;

  try {
    if (req.method === 'GET') {
      // Alles in EINER Anfrage: Servername, Kanäle und gespeicherte Einstellungen.
      // (Mehrere gleichzeitige Anfragen würden Discords Rate-Limit auslösen.)
      const gr = await bot(`/guilds/${a.gid}`);
      if (!gr.ok) return res.status(404).json({ error: 'no_bot' });
      const guild = await gr.json();
      const cr = await bot(`/guilds/${a.gid}/channels`);
      if (!cr.ok) return res.status(404).json({ error: 'no_bot' });
      const all = await cr.json();
      const cats = Object.fromEntries(all.filter(c => c.type === 4).map(c => [c.id, c.name]));
      const channels = all.filter(c => c.type === 0 || c.type === 5)
        .sort((x, y) => x.position - y.position)
        .map(c => ({ id: c.id, name: c.name, category: cats[c.parent_id] || null }));

      const g = await readGuild(a.gid);
      return res.json({ guild: { id: guild.id, name: guild.name }, channels, config: (g && g.data && g.data.welcomer) || null });
    }

    if (req.method === 'POST') {
      // Zusätzlicher Schutz: nur Anfragen von der eigenen Website
      const origin = req.headers.origin;
      if (origin && origin !== process.env.SITE_URL) return res.status(403).json({ error: 'forbidden' });

      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
      const cfg = validate(body);
      if (!cfg) return res.status(400).json({ error: 'invalid' });

      if (cfg.enabled) {
        if (!cfg.channelId) return res.status(400).json({ error: 'channel_required' });
        const hasText = cfg.textEnabled && cfg.text.trim();
        const hasEmbed = cfg.embedEnabled && (cfg.embed.title.trim() || cfg.embed.description.trim());
        if (!hasText && !hasEmbed) return res.status(400).json({ error: 'content_required' });
      }

      // Server-Name (für den Ordner) und – falls gesetzt – Kanal prüfen
      const gr = await bot(`/guilds/${a.gid}`);
      if (!gr.ok) return res.status(404).json({ error: 'no_bot' });
      const guildName = (await gr.json()).name;
      if (cfg.channelId) {
        const r = await bot(`/guilds/${a.gid}/channels`);
        if (!r.ok) return res.status(404).json({ error: 'no_bot' });
        const ok = (await r.json()).some(c => c.id === cfg.channelId && (c.type === 0 || c.type === 5));
        if (!ok) return res.status(400).json({ error: 'channel_unknown' });
      }

      await updateGuild(a.gid, guildName, (d) => { d.welcomer = cfg; });
      return res.json({ ok: true, config: cfg });
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'method' });
  } catch (e) {
    const detail = safe(e.detail || (e.code ? '' : `${e.name}: ${e.message}`));
    console.error('welcomer api:', e.code || e.name, e.status || '', detail);   // erscheint in den Vercel-Logs
    if (e.code === 'no_db' || e.code === 'db_auth') return res.status(503).json({ error: e.code, detail });
    if (e.code === 'bad_json') return res.status(422).json({ error: 'bad_json' });
    res.status(502).json({ error: 'server', detail });
  }
};
