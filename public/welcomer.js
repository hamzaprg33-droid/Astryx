(async () => {
  const { t, lang } = window.I18N;
  const F = window.FEATURES;
  const $ = (s) => document.querySelector(s);
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const HEX = /^#[0-9a-fA-F]{6}$/;

  const L = {
    de: {
      name: 'Willkommer', back: 'Zurück zum Dashboard',
      enable: 'Willkommer aktivieren', enableDesc: 'Begrüßt neue Mitglieder automatisch mit deiner Nachricht.',
      channel: 'Willkommens-Kanal', channelPh: 'Kanalnamen eingeben', channelHint: 'In diesen Kanal wird die Nachricht gesendet.',
      noChannel: 'Kein Kanal gefunden',
      message: 'Willkommensnachricht', textSwitch: 'Text-Nachricht', embedSwitch: 'Embed',
      text: 'Text', embedTitle: 'Titel', embedDesc: 'Beschreibung', color: 'Farbe (Hex)', footer: 'Footer',
      vars: 'Platzhalter: {user} oder @neuer_user (Erwähnung), {username}, {server}, {members}',
      preview: 'Vorschau', previewEmpty: 'Aktiviere Text oder Embed, um eine Vorschau zu sehen.',
      unsaved: 'Vorsicht – du hast ungespeicherte Änderungen!', reset: 'Zurücksetzen', save: 'Speichern',
      saving: 'Speichere …', saved: 'Gespeichert ✔',
      noChannelErr: 'Bitte wähle einen Willkommens-Kanal aus.',
      contentErr: 'Aktiviere und fülle mindestens Text oder Embed aus.',
      colorErr: 'Ungültige Hex-Farbe (Beispiel: #2ECC71).',
      saveErr: 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
      noDb: 'Der Datenspeicher ist nicht eingerichtet oder nicht erreichbar.',
      badJson: 'Die Datei guild_data.json ist fehlerhaft und muss zuerst repariert werden.',
      loadErr: 'Die Einstellungen konnten nicht geladen werden.',
    },
    en: {
      name: 'Welcomer', back: 'Back to dashboard',
      enable: 'Enable Welcomer', enableDesc: 'Greets new members automatically with your message.',
      channel: 'Welcome channel', channelPh: 'Enter channel name', channelHint: 'The message will be sent to this channel.',
      noChannel: 'No channel found',
      message: 'Welcome message', textSwitch: 'Text message', embedSwitch: 'Embed',
      text: 'Text', embedTitle: 'Title', embedDesc: 'Description', color: 'Color (hex)', footer: 'Footer',
      vars: 'Placeholders: {user} or @new_user (mention), {username}, {server}, {members}',
      preview: 'Preview', previewEmpty: 'Enable text or embed to see a preview.',
      unsaved: 'Careful — you have unsaved changes!', reset: 'Reset', save: 'Save',
      saving: 'Saving …', saved: 'Saved ✔',
      noChannelErr: 'Please select a welcome channel.',
      contentErr: 'Enable and fill in at least the text or the embed.',
      colorErr: 'Invalid hex color (example: #2ECC71).',
      saveErr: 'Saving failed. Please try again.',
      noDb: 'The data storage is not set up or not reachable.',
      badJson: 'The file guild_data.json is broken and has to be fixed first.',
      loadErr: 'The settings could not be loaded.',
    },
  }[lang];

  const D = lang === 'de'
    ? { text: '@neuer_user', title: 'Willkommen auf {server}! 🎉',
        description: 'Schön, dass du da bist, {user}!\nLies dir die Regeln durch und fühl dich wie zuhause. Du bist unser {members}. Mitglied.' }
    : { text: '@new_user', title: 'Welcome to {server}! 🎉',
        description: 'Great to have you here, {user}!\nTake a look at the rules and make yourself at home. You are member #{members}.' };

  const defaults = () => ({
    enabled: false, channelId: '', textEnabled: true, text: D.text,
    embedEnabled: true, embed: { title: D.title, description: D.description, color: '#2ECC71' },
  });
  const norm = (c) => { const d = defaults(); return { ...d, ...(c || {}), embed: { ...d.embed, ...((c && c.embed) || {}) } }; };

  // ---------- Zugriff ----------
  const [uid, gid] = location.pathname.split('/').filter(Boolean);
  $('#back').href = `/${uid}/${gid}`;
  $('#back').textContent = L.back;
  $('#title').append(L.name, F.tag('beta', true));
  const msg = $('#msg');

  let me = null;
  try { const r = await fetch('/api/me'); if (r.ok) me = (await r.json()).user; } catch {}
  if (!me) return location.replace('/verify');
  if (me.id !== uid) return location.replace(`/${me.id}/guilds`);

  const fail = (res) => {
    if (res && res.status === 401) msg.textContent = t('guilds_expired');
    else if (res && res.status === 403) msg.textContent = t('guilds_forbidden');
    else if (res && res.status === 404) msg.textContent = t('dash_nobot');
    else if (res && res.status === 503) msg.textContent = L.noDb;
    else if (res && res.status === 422) msg.textContent = L.badJson;
    else msg.textContent = L.loadErr;
  };

  // ---------- Daten laden (erst /guild, damit ein Token-Refresh nicht doppelt läuft) ----------
  const q = `uid=${uid}&gid=${gid}`;
  const get = (p) => fetch(`/api/${p}?${q}`, { cache: 'no-store' }).catch(() => null);
  const gr = await get('guild');
  if (!gr || !gr.ok) return fail(gr);
  const guild = await gr.json();
  const [cr, wr] = await Promise.all([get('channels'), get('welcomer')]);
  if (!cr || !cr.ok) return fail(cr);
  if (!wr || !wr.ok) return fail(wr);
  const channels = (await cr.json()).channels;
  const stored = (await wr.json()).config;

  let saved = norm(stored);
  if (saved.channelId && !channels.some(c => c.id === saved.channelId)) saved.channelId = '';
  let cur = clone(saved);

  // ---------- UI-Bausteine ----------
  const app = $('#app');
  const refs = {};

  const sw = (onChange) => {
    const input = make('input', { type: 'checkbox' });
    input.addEventListener('change', () => onChange(input.checked));
    return { input, el: make('label', { className: 'switch' }, input, make('span', { className: 'slider' })) };
  };
  const field = (label, ...kids) => make('div', { className: 'field' }, make('label', { textContent: label }), ...kids);

  const channelBox = () => {
    const input = make('input', { className: 'input', type: 'text', placeholder: L.channelPh, autocomplete: 'off' });
    const list = make('div', { className: 'combo-list' });
    list.hidden = true;
    const selected = () => channels.find(c => c.id === cur.channelId);
    const showSelected = () => { const c = selected(); input.value = c ? `# ${c.name}` : ''; };
    const renderList = (query = '') => {
      list.replaceChildren();
      const found = channels.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
      if (!found.length) { list.append(make('div', { className: 'combo-empty', textContent: L.noChannel })); return; }
      found.forEach(c => {
        const o = make('div', { className: 'combo-opt' + (c.id === cur.channelId ? ' sel' : '') },
          make('span', { textContent: `# ${c.name}` }),
          ...(c.category ? [make('small', { textContent: c.category })] : []));
        o.addEventListener('mousedown', (e) => { // mousedown, damit das Feld nicht vorher den Fokus verliert
          e.preventDefault();
          cur.channelId = c.id; showSelected(); list.hidden = true; input.blur(); changed();
        });
        list.append(o);
      });
    };
    input.addEventListener('focus', () => { input.select(); renderList(); list.hidden = false; });
    input.addEventListener('input', () => { renderList(input.value.replace(/^#\s*/, '').trim()); list.hidden = false; });
    input.addEventListener('blur', () => { list.hidden = true; showSelected(); });
    return { el: make('div', { className: 'combo' }, input, list), sync: showSelected };
  };

  // Platzhalter für die Vorschau ersetzen
  const prev = (s) => {
    s = s.replaceAll('{username}', 'NeuerUser').replaceAll('{server}', guild.name).replaceAll('{members}', '128');
    const frag = document.createDocumentFragment();
    s.split(/(\{user\}|@neuer_user|@new_user)/).forEach((p, i) =>
      frag.append(i % 2 ? make('span', { className: 'mention', textContent: '@NeuerUser' }) : p));
    return frag;
  };

  // ---------- Aufbau ----------
  const enSw = sw(v => { cur.enabled = v; changed(); });
  app.append(make('section', { className: 'cfg-card row' },
    make('div', {}, make('h3', { textContent: L.enable }), make('p', { className: 'hint', textContent: L.enableDesc })),
    enSw.el));

  const combo = channelBox();
  app.append(make('section', { className: 'cfg-card' },
    make('h3', { textContent: L.channel }), make('p', { className: 'hint', textContent: L.channelHint }), combo.el));

  const txtSw = sw(v => { cur.textEnabled = v; changed(); });
  const emSw = sw(v => { cur.embedEnabled = v; changed(); });
  refs.text = make('textarea', { className: 'input', rows: 3, maxLength: 2000 });
  refs.text.addEventListener('input', () => { cur.text = refs.text.value; changed(); });
  refs.title = make('input', { className: 'input', type: 'text', maxLength: 256 });
  refs.title.addEventListener('input', () => { cur.embed.title = refs.title.value; changed(); });
  refs.desc = make('textarea', { className: 'input', rows: 5, maxLength: 4000 });
  refs.desc.addEventListener('input', () => { cur.embed.description = refs.desc.value; changed(); });
  refs.color = make('input', { className: 'input', type: 'text', maxLength: 7, placeholder: '#2ECC71' });
  refs.pick = make('input', { className: 'colorpick', type: 'color' });
  refs.color.addEventListener('input', () => {
    cur.embed.color = refs.color.value.trim();
    refs.color.classList.toggle('bad', !HEX.test(cur.embed.color));
    if (HEX.test(cur.embed.color)) refs.pick.value = cur.embed.color.toLowerCase();
    changed();
  });
  refs.color.addEventListener('blur', () => { // "2ecc71" -> "#2ecc71"
    if (/^[0-9a-f]{6}$/i.test(refs.color.value.trim())) { refs.color.value = '#' + refs.color.value.trim(); refs.color.dispatchEvent(new Event('input')); }
  });
  refs.pick.addEventListener('input', () => {
    cur.embed.color = refs.pick.value.toUpperCase(); refs.color.value = cur.embed.color; refs.color.classList.remove('bad'); changed();
  });
  refs.footer = make('input', { className: 'input', type: 'text', value: 'Powered by Astryx', disabled: true });

  refs.textWrap = make('div', {}, field(L.text, refs.text));
  refs.embedWrap = make('div', {},
    field(L.embedTitle, refs.title), field(L.embedDesc, refs.desc),
    field(L.color, make('div', { className: 'colorrow' }, refs.pick, refs.color)),
    field(L.footer, refs.footer));

  app.append(make('section', { className: 'cfg-card' },
    make('h3', { textContent: L.message }),
    make('div', { className: 'sub-head' }, make('b', { textContent: L.textSwitch }), txtSw.el), refs.textWrap,
    make('div', { className: 'sub-head' }, make('b', { textContent: L.embedSwitch }), emSw.el), refs.embedWrap,
    make('p', { className: 'hint vars', textContent: L.vars })));

  refs.preview = make('div', { className: 'pv' });
  app.append(make('section', { className: 'cfg-card' }, make('h3', { textContent: L.preview }), refs.preview));

  // ---------- Zustand -> Oberfläche ----------
  const sync = () => {
    enSw.input.checked = cur.enabled; combo.sync();
    txtSw.input.checked = cur.textEnabled; emSw.input.checked = cur.embedEnabled;
    refs.text.value = cur.text; refs.title.value = cur.embed.title; refs.desc.value = cur.embed.description;
    refs.color.value = cur.embed.color; refs.color.classList.toggle('bad', !HEX.test(cur.embed.color));
    if (HEX.test(cur.embed.color)) refs.pick.value = cur.embed.color.toLowerCase();
  };

  const renderPreview = () => {
    refs.textWrap.classList.toggle('dim', !cur.textEnabled);
    refs.embedWrap.classList.toggle('dim', !cur.embedEnabled);
    const box = refs.preview;
    box.replaceChildren();
    const hasText = cur.textEnabled && cur.text.trim();
    const hasEmbed = cur.embedEnabled && (cur.embed.title.trim() || cur.embed.description.trim());
    if (!hasText && !hasEmbed) { box.append(make('div', { className: 'hint', textContent: L.previewEmpty })); return; }
    box.append(make('div', { className: 'pv-head' }, make('span', { className: 'pv-bot', textContent: 'Astryx' }), make('span', { className: 'pv-app', textContent: 'APP' })));
    if (hasText) box.append(make('div', { className: 'pv-text' }, prev(cur.text)));
    if (hasEmbed) {
      const e = make('div', { className: 'pv-embed' });
      e.style.borderLeftColor = HEX.test(cur.embed.color) ? cur.embed.color : '#555';
      if (cur.embed.title.trim()) e.append(make('div', { className: 'pv-etitle' }, prev(cur.embed.title)));
      if (cur.embed.description.trim()) e.append(make('div', { className: 'pv-edesc' }, prev(cur.embed.description)));
      e.append(make('div', { className: 'pv-efoot', textContent: 'Powered by Astryx' }));
      box.append(e);
    }
  };

  // ---------- Speichern-Leiste (wie bei Discord) ----------
  const bar = $('#savebar');
  const barMsg = make('span', { className: 'bar-msg' });
  const resetBtn = make('button', { className: 'btn ghost', type: 'button', textContent: L.reset });
  const saveBtn = make('button', { className: 'btn', type: 'button', textContent: L.save });
  bar.append(barMsg, resetBtn, saveBtn);
  let note = null; // { text, kind }

  const dirty = () => JSON.stringify(cur) !== JSON.stringify(saved);
  const updateBar = () => {
    const d = dirty();
    bar.classList.toggle('show', d || !!note);
    bar.classList.toggle('only-msg', !!note && note.kind === 'ok');
    barMsg.className = 'bar-msg' + (note ? ' ' + note.kind : '');
    barMsg.textContent = note ? note.text : L.unsaved;
  };
  const changed = () => { if (note && note.kind === 'err') note = null; renderPreview(); updateBar(); };

  const validate = () => {
    if (!HEX.test(cur.embed.color)) return L.colorErr;
    if (cur.enabled) {
      if (!cur.channelId) return L.noChannelErr;
      const hasText = cur.textEnabled && cur.text.trim();
      const hasEmbed = cur.embedEnabled && (cur.embed.title.trim() || cur.embed.description.trim());
      if (!hasText && !hasEmbed) return L.contentErr;
    }
    return null;
  };

  resetBtn.addEventListener('click', () => { cur = clone(saved); note = null; sync(); changed(); });
  saveBtn.addEventListener('click', async () => {
    const err = validate();
    if (err) { note = { text: err, kind: 'err' }; return updateBar(); }
    saveBtn.disabled = resetBtn.disabled = true;
    note = { text: L.saving, kind: '' }; updateBar();
    try {
      const r = await fetch(`/api/welcomer?${q}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cur),
      });
      if (r.status === 401) note = { text: t('guilds_expired'), kind: 'err' };
      else if (r.status === 503) note = { text: L.noDb, kind: 'err' };
      else if (r.status === 422) note = { text: L.badJson, kind: 'err' };
      else if (!r.ok) note = { text: L.saveErr, kind: 'err' };
      else {
        saved = clone(cur);
        note = { text: L.saved, kind: 'ok' };
        setTimeout(() => { note = null; updateBar(); }, 1600);
      }
    } catch { note = { text: L.saveErr, kind: 'err' }; }
    saveBtn.disabled = resetBtn.disabled = false;
    updateBar();
  });

  sync();
  renderPreview();
  updateBar();
})();
