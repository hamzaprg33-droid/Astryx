const { guildAccess } = require('./_lib/access');
const { bot } = require('./_lib/discord');
const { loadRoles } = require('./_lib/roles');
const { readGuild, updateGuild } = require('./_lib/guilddata');

const MAX_TEMPLATES = 100;
const MAX_TOTAL = 450000;   // Zeichen aller Vorlagen zusammen (GitHub liest Dateien bis 1 MB)
const MAX_ONE = 40000;      // Zeichen pro Vorlage
const LIM = { content: 2000, embeds: 10, embedTotal: 6000, fields: 25, rows: 5, buttons: 5, options: 25, actions: 5, roles: 10 };
const ID = /^[a-z0-9]{4,12}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const URL_OK = /^https?:\/\/\S{1,2000}$/i;
const STYLES = { primary: 1, secondary: 2, success: 3, danger: 4 };
const WEBHOOK = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d{15,25})\/([A-Za-z0-9_-]{20,120})\/?$/;
const TAG = 'Powered by Astryx';
const EDIT_LINK = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/channels\/(\d{1,25})\/(\d{1,25})\/(\d{1,25})\/?$/;

// ---------- Prüfregeln (strikt: der Server ist die letzte Instanz) ----------
const bad = (error, detail = '', extra = {}) => Object.assign(new Error(error), { code: 'invalid_msg', error, detail, ...extra });
const text = (v, max, name, { min = 0, trim = false } = {}) => {
  let s = v === undefined || v === null ? '' : v;
  if (typeof s !== 'string') throw bad('invalid', `${name}: text expected`);
  if (trim) s = s.trim();
  if (s.length > max) throw bad('too_long', `${name}: max ${max}`);
  if (s.length < min) throw bad('required', `${name}: required`);
  return s;
};
const int = (v, min, max, name) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw bad('invalid', `${name}: ${min}-${max}`);
  return n;
};
const arr = (v, max, name) => {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > max) throw bad('invalid', `${name}: list, max ${max}`);
  return v;
};
const obj = (v, name) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw bad('invalid', `${name}: object expected`);
  return v;
};
const url = (v, name) => {
  const s = text(v, 2000, name, { trim: true });
  if (s && !URL_OK.test(s)) throw bad('invalid_url', name);
  return s;
};

function normalizeActions(raw, path, roleById) {
  const actions = arr(raw, LIM.actions, `${path}.actions`).map((a, k) => {
    obj(a, `${path}.actions[${k}]`);
    if (a.type === 'message') {
      return { type: 'message', text: text(a.text, 2000, `${path}.actions[${k}].text`, { min: 1 }), mode: a.mode === 'dm' ? 'dm' : 'ephemeral' };
    }
    if (a.type === 'role_add' || a.type === 'role_remove') {
      const roles = arr(a.roles, LIM.roles, `${path}.actions[${k}].roles`);
      if (!roles.length) throw bad('required', `${path}.actions[${k}].roles`);
      const seen = new Set();
      roles.forEach((r) => {
        if (typeof r !== 'string' || !/^\d+$/.test(r) || seen.has(r)) throw bad('invalid', `${path}: role id`);
        seen.add(r);
        const info = roleById[r];
        if (!info) throw bad('role_unknown', r);
        if (!info.assignable) throw bad('role_unassignable', info.name, { role: info.name });
      });
      return { type: a.type, roles: [...roles] };
    }
    throw bad('invalid', `${path}.actions[${k}].type`);
  });
  if (!actions.length) throw bad('action_required', path);
  return actions;
}

function normalizeTemplate(raw, roleById) {
  obj(raw, 'template');
  const id = text(raw.id, 12, 'id', { min: 4 });
  if (!ID.test(id)) throw bad('invalid', 'id');
  const name = text(raw.name, 40, 'name', { min: 1, trim: true });
  const content = text(raw.content, LIM.content, 'content');
  const used = new Set();
  const uniq = (x, n) => { if (typeof x !== 'string' || !ID.test(x) || used.has(x)) throw bad('invalid', `${n}: id`); used.add(x); return x; };

  let total = 0;
  const embeds = arr(raw.embeds, LIM.embeds, 'embeds').map((e, i) => {
    const p = `embeds[${i}]`;
    obj(e, p);
    const color = e.color === undefined || e.color === '' ? '' : e.color;
    if (color && !(typeof color === 'string' && HEX.test(color))) throw bad('invalid_color', p);
    const o = {
      color,
      author: text(e.author, 256, `${p}.author`),
      title: text(e.title, 256, `${p}.title`),
      description: text(e.description, 4096, `${p}.description`),
      thumbnail: url(e.thumbnail, `${p}.thumbnail`),
      image: url(e.image, `${p}.image`),
      footer: text(e.footer, 2048, `${p}.footer`),
      fields: arr(e.fields, LIM.fields, `${p}.fields`).map((f, k) => {
        obj(f, `${p}.fields[${k}]`);
        return { name: text(f.name, 256, `${p}.fields[${k}].name`, { min: 1 }), value: text(f.value, 1024, `${p}.fields[${k}].value`, { min: 1 }), inline: f.inline === true };
      }),
    };
    total += o.author.length + o.title.length + o.description.length + o.footer.length + o.fields.reduce((n, f) => n + f.name.length + f.value.length, 0);
    return o;
  });
  if (total > LIM.embedTotal) throw bad('embed_total', `max ${LIM.embedTotal}`);

  const components = arr(raw.components, LIM.rows, 'components').map((row, ri) => {
    const p = `components[${ri}]`;
    obj(row, p);
    const rid = uniq(row.id, p);
    if (row.type === 'buttons') {
      const items = arr(row.items, LIM.buttons, `${p}.items`);
      if (!items.length) throw bad('row_empty', p);
      return {
        id: rid, type: 'buttons',
        items: items.map((b, bi) => {
          const bp = `${p}.items[${bi}]`;
          obj(b, bp);
          if (!(b.style in STYLES)) throw bad('invalid', `${bp}.style`);
          return { id: uniq(b.id, bp), label: text(b.label, 80, `${bp}.label`, { min: 1, trim: true }), style: b.style, actions: normalizeActions(b.actions, bp, roleById) };
        }),
      };
    }
    if (row.type === 'select') {
      const items = arr(row.items, LIM.options, `${p}.items`);
      if (!items.length) throw bad('row_empty', p);
      const minValues = int(row.minValues === undefined ? 1 : row.minValues, 1, items.length, `${p}.minValues`);
      const maxValues = int(row.maxValues === undefined ? 1 : row.maxValues, minValues, items.length, `${p}.maxValues`);
      return {
        id: rid, type: 'select', placeholder: text(row.placeholder, 150, `${p}.placeholder`), minValues, maxValues,
        items: items.map((o, oi) => {
          const op = `${p}.items[${oi}]`;
          obj(o, op);
          return { id: uniq(o.id, op), label: text(o.label, 100, `${op}.label`, { min: 1, trim: true }), description: text(o.description, 100, `${op}.description`), actions: normalizeActions(o.actions, op, roleById) };
        }),
      };
    }
    throw bad('invalid', `${p}.type`);
  });

  const value = { id, name, content, embeds, components };
  if (JSON.stringify(value).length > MAX_ONE) throw bad('too_large', 'template');
  return value;
}

// ---------- Discord-Nachricht aus einer Vorlage bauen ----------
const fill = (s, g) => String(s).replace(/\{server\}/gi, g.name).replace(/\{members\}/gi, String(g.approximate_member_count ?? ''));

function buildPayload(tpl, guild, webhook) {
  const embeds = tpl.embeds.map((e) => {
    const o = {};
    if (e.author) o.author = { name: fill(e.author, guild).slice(0, 256) };
    if (e.title) o.title = fill(e.title, guild).slice(0, 256);
    if (e.description) o.description = fill(e.description, guild).slice(0, 4096);
    if (e.thumbnail) o.thumbnail = { url: e.thumbnail };
    if (e.image) o.image = { url: e.image };
    if (e.footer) o.footer = { text: fill(e.footer, guild).slice(0, 2048) };
    if (e.fields.length) o.fields = e.fields.map(f => ({ name: fill(f.name, guild).slice(0, 256), value: fill(f.value, guild).slice(0, 1024), inline: !!f.inline }));
    if (!Object.keys(o).length) return null;   // Embed nur mit Farbe wäre leer -> weglassen
    if (e.color) o.color = parseInt(e.color.slice(1), 16);
    return o;
  }).filter(Boolean);
  let content = fill(tpl.content, guild).slice(0, 2000);
  if (!content.trim() && !embeds.length) throw bad('empty_message');
  if (!content.trim()) content = '';

  if (webhook) {
    // Über Webhook: kein Button/Menü möglich, dafür kommt "Powered by Astryx" dazu
    if (embeds.length) {
      const last = embeds[embeds.length - 1];
      const f = last.footer ? last.footer.text : '';
      last.footer = { text: (f ? `${f} · ${TAG}` : TAG).slice(0, 2048) };
    } else {
      content = `${content}\n-# ${TAG}`;
      if (content.length > 2000) throw bad('too_long', 'content + footer');
    }
  }

  const payload = { content, embeds };
  if (!webhook && tpl.components.length) {
    payload.components = tpl.components.map(row => ({
      type: 1,
      components: row.type === 'buttons'
        ? row.items.map(b => ({ type: 2, style: STYLES[b.style], label: b.label, custom_id: `tpl:${tpl.id}:${b.id}` }))
        : [{
          type: 3, custom_id: `tpl:${tpl.id}:${row.id}`, min_values: row.minValues, max_values: row.maxValues,
          ...(row.placeholder ? { placeholder: row.placeholder } : {}),
          options: row.items.map(o => ({ label: o.label, value: o.id, ...(o.description ? { description: o.description } : {}) })),
        }],
    }));
  }
  return payload;
}

// Keine Zugangsdaten (GitHub-Token, Webhook-Token) in Fehlermeldungen
const safe = (s) => {
  const token = process.env.GITHUB_TOKEN || '';
  let t = String(s || '');
  if (token.trim()) t = t.split(token.trim()).join('***');
  return t.replace(/(gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, '***').replace(/webhooks\/\d+\/[A-Za-z0-9_-]+/g, 'webhooks/***').slice(0, 500);
};

const cleanList = (g) => {
  const l = g && g.data && g.data.messages && Array.isArray(g.data.messages.templates) ? g.data.messages.templates : [];
  return l.filter(t => t && typeof t === 'object' && typeof t.id === 'string');
};

// Antwort von Discord auswerten (Senden an Kanal bzw. Webhook)
async function discordFailure(res, r, webhook) {
  let j = {}; try { j = await r.json(); } catch {}
  if (webhook && (r.status === 404 || r.status === 401 || j.code === 10015 || j.code === 50027)) return res.status(400).json({ error: 'webhook_unknown' });
  if (j.code === 50005) return res.status(400).json({ error: 'not_bot_message' });
  if (r.status === 403 || j.code === 50013 || j.code === 50001) return res.status(403).json({ error: 'no_permission' });
  if (r.status === 404) return res.status(400).json({ error: 'channel_unknown' });
  if (r.status === 429) return res.status(429).json({ error: 'rate_limited' });
  return res.status(400).json({ error: 'discord_rejected', detail: safe(j.message || `Discord ${r.status}`) });
}

module.exports = async (req, res) => {
  const a = await guildAccess(req, res);
  if (!a) return;

  try {
    if (req.method === 'GET') {
      const [grS, crS, rolesS, gS] = await Promise.allSettled([bot(`/guilds/${a.gid}`), bot(`/guilds/${a.gid}/channels`), loadRoles(a.gid), readGuild(a.gid)]);
      for (const s of [grS, crS, rolesS]) if (s.status === 'rejected') throw s.reason;
      if (!grS.value.ok || !crS.value.ok || !rolesS.value) return res.status(404).json({ error: 'no_bot' });
      if (gS.status === 'rejected') throw gS.reason;
      const guild = await grS.value.json();
      const all = await crS.value.json();
      const cats = Object.fromEntries(all.filter(c => c.type === 4).map(c => [c.id, c.name]));
      const channels = all.filter(c => c.type === 0 || c.type === 5).sort((x, y) => x.position - y.position)
        .map(c => ({ id: c.id, name: c.name, category: cats[c.parent_id] || null }));
      return res.json({ guild: { id: guild.id, name: guild.name }, channels, roles: rolesS.value, templates: cleanList(gS.value) });
    }

    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'method' }); }

    const origin = req.headers.origin;
    if (origin && origin !== process.env.SITE_URL) return res.status(403).json({ error: 'forbidden' });
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'invalid' });

    // ---------- Speichern ----------
    if (body.op === 'save') {
      const [gr, roles] = await Promise.all([bot(`/guilds/${a.gid}`), loadRoles(a.gid)]);
      if (!gr.ok || !roles) return res.status(404).json({ error: 'no_bot' });
      const tpl = normalizeTemplate(body.template, Object.fromEntries(roles.map(r => [r.id, r])));
      await updateGuild(a.gid, (await gr.json()).name, (d) => {
        const m = d.messages && typeof d.messages === 'object' && !Array.isArray(d.messages) ? d.messages : {};
        const list = Array.isArray(m.templates) ? m.templates.slice() : [];
        const idx = list.findIndex(x => x && x.id === tpl.id);
        if (list.some((x, i) => i !== idx && x && String(x.name).toLowerCase() === tpl.name.toLowerCase())) throw bad('name_taken');
        if (idx === -1 && list.length >= MAX_TEMPLATES) throw bad('too_many');
        if (idx === -1) list.push(tpl); else list[idx] = tpl;
        if (JSON.stringify(list).length > MAX_TOTAL) throw bad('too_large', 'all templates');
        d.messages = { ...m, templates: list };
      });
      return res.json({ ok: true, template: tpl });
    }

    // ---------- Löschen ----------
    if (body.op === 'delete') {
      const id = String(body.id || '');
      if (!ID.test(id)) return res.status(400).json({ error: 'invalid' });
      const gr = await bot(`/guilds/${a.gid}`);
      if (!gr.ok) return res.status(404).json({ error: 'no_bot' });
      await updateGuild(a.gid, (await gr.json()).name, (d) => {
        const m = d.messages && typeof d.messages === 'object' && !Array.isArray(d.messages) ? d.messages : {};
        d.messages = { ...m, templates: (Array.isArray(m.templates) ? m.templates : []).filter(x => !(x && x.id === id)) };
      });
      return res.json({ ok: true });
    }

    // ---------- Senden (Kanal oder Webhook) ----------
    if (body.op === 'send' || body.op === 'webhook') {
      const id = String(body.id || '');
      if (!ID.test(id)) return res.status(400).json({ error: 'invalid' });
      const webhook = body.op === 'webhook';
      let hook = null;
      if (webhook) {
        hook = WEBHOOK.exec(String(body.url || '').trim());
        if (!hook) return res.status(400).json({ error: 'webhook_invalid' });
      } else if (!/^\d+$/.test(String(body.channelId || ''))) {
        return res.status(400).json({ error: 'invalid' });
      }

      const [gr, cr, gS] = await Promise.all([bot(`/guilds/${a.gid}?with_counts=true`), webhook ? Promise.resolve(null) : bot(`/guilds/${a.gid}/channels`), readGuild(a.gid)]);
      if (!gr.ok || (cr && !cr.ok)) return res.status(404).json({ error: 'no_bot' });
      const tpl = cleanList(gS).find(x => x.id === id);
      if (!tpl) return res.status(404).json({ error: 'template_missing' });
      if (!webhook && !(await cr.json()).some(c => c.id === String(body.channelId) && (c.type === 0 || c.type === 5))) return res.status(400).json({ error: 'channel_unknown' });

      // Gespeicherte Vorlage erneut prüfen, bevor sie rausgeht (Rollen sind hier egal: es wird nur gesendet)
      const guild = await gr.json();
      const roleAny = new Proxy({}, { get: () => ({ assignable: true, name: '' }) });
      const payload = buildPayload(normalizeTemplate(tpl, roleAny), guild, webhook);

      const r = webhook
        ? await fetch(`https://discord.com/api/webhooks/${hook[1]}/${hook[2]}?wait=true`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await bot(`/channels/${body.channelId}/messages`, { method: 'POST', body: JSON.stringify(payload) });
      if (!r.ok) return discordFailure(res, r, webhook);
      const sent = await r.json().catch(() => ({}));
      return res.json({ ok: true, url: !webhook && sent.id ? `https://discord.com/channels/${a.gid}/${body.channelId}/${sent.id}` : null });
    }

    // ---------- Bereits gesendete Nachricht mit der Vorlage bearbeiten ----------
    if (body.op === 'edit') {
      const id = String(body.id || '');
      if (!ID.test(id)) return res.status(400).json({ error: 'invalid' });
      const m = EDIT_LINK.exec(String(body.link || '').trim());
      if (!m) return res.status(400).json({ error: 'link_invalid' });
      if (m[1] !== a.gid) return res.status(400).json({ error: 'link_wrong_server' });
      const channelId = m[2], messageId = m[3];
      const botId = (process.env.DISCORD_CLIENT_ID || '').trim();

      const [gr, gS, chR, msgR] = await Promise.all([
        bot(`/guilds/${a.gid}?with_counts=true`), readGuild(a.gid), bot(`/channels/${channelId}`), bot(`/channels/${channelId}/messages/${messageId}`),
      ]);
      if (!gr.ok) return res.status(404).json({ error: 'no_bot' });
      const tpl = cleanList(gS).find(x => x.id === id);
      if (!tpl) return res.status(404).json({ error: 'template_missing' });

      const missing = (r) => (r.status === 404 ? res.status(400).json({ error: 'message_unknown' }) : discordFailure(res, r, false));
      if (!chR.ok) return missing(chR);
      // Der Kanal muss WIRKLICH zu diesem Server gehören (sonst könnte man Nachrichten des Bots auf fremden Servern ändern)
      if ((await chR.json()).guild_id !== a.gid) return res.status(400).json({ error: 'link_wrong_server' });
      if (!msgR.ok) return missing(msgR);
      const old = await msgR.json();
      if (old.webhook_id) return res.status(400).json({ error: 'webhook_message' });   // Webhook-Nachrichten kann der Bot nicht ändern
      if (botId && (!old.author || old.author.id !== botId)) return res.status(400).json({ error: 'not_bot_message' });

      const roleAny = new Proxy({}, { get: () => ({ assignable: true, name: '' }) });
      const payload = buildPayload(normalizeTemplate(tpl, roleAny), await gr.json(), false);
      payload.components = payload.components || [];   // hat die Vorlage keine Buttons, werden alte Buttons entfernt
      const r = await bot(`/channels/${channelId}/messages/${messageId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      if (!r.ok) return discordFailure(res, r, false);
      return res.json({ ok: true, url: `https://discord.com/channels/${a.gid}/${channelId}/${messageId}` });
    }

    return res.status(400).json({ error: 'invalid' });
  } catch (e) {
    if (e.code === 'invalid_msg') {
      const status = e.error === 'name_taken' ? 409 : 400;
      return res.status(status).json({ error: e.error, detail: safe(e.detail), role: e.role });
    }
    const detail = safe(e.detail || (e.code ? '' : `${e.name}: ${e.message}`));
    console.error('messages api:', e.code || e.name, e.status || '', detail);
    if (e.code === 'no_db' || e.code === 'db_auth') return res.status(503).json({ error: e.code, detail });
    if (e.code === 'bad_json') return res.status(422).json({ error: 'bad_json' });
    res.status(502).json({ error: 'server', detail });
  }
};
