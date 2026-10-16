(async () => {
  const { t, lang } = window.I18N;
  const $ = (s) => document.querySelector(s);
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const MAX_ROLES = 10, MAX_TIMER = 600;

  const L = {
    de: {
      name: 'Beitritts-Rollen', back: 'Zurück zum Dashboard',
      enable: 'Beitritts-Rollen aktivieren', enableDesc: 'Neue Mitglieder bekommen automatisch Rollen.',
      roles: 'Rollen', rolesHint: 'Die Reihenfolge ist die Reihenfolge der Vergabe: die erste Rolle sofort, jede weitere nach dem Timer.',
      rolePh: 'Rollennamen eingeben', noRole: 'Keine Rolle gefunden', none: '— Keine —', noneSelected: 'Noch keine Rolle ausgewählt.',
      up: 'Nach oben', down: 'Nach unten', remove: 'Entfernen',
      reasonManaged: 'von Integration verwaltet', reasonHierarchy: 'über der Bot-Rolle', picked: '✓ ausgewählt',
      timer: 'Timer (in Sekunden)', timerHint: 'Wartezeit zwischen den Rollen. Pflicht, sobald du mehr als eine Rolle wählst.', required: 'Pflicht',
      bots: 'Bots', botsSwitch: 'Rollen gelten auch für Bots', botsSwitchDesc: 'Aus: Bots bekommen die Rollen von oben nicht.',
      botRole: 'Rolle nur für Bots', botRoleHint: 'Diese Rolle bekommen Bots sofort beim Beitritt (optional).',
      flow: 'Ablauf', flowUsers: 'Neue Mitglieder', flowBots: 'Bots', flowEmpty: 'Keine Rolle',
      now: 'Sofort', after: (s) => `Nach ${s} ${s === 1 ? 'Sekunde' : 'Sekunden'}`,
      unsaved: 'Vorsicht – du hast ungespeicherte Änderungen!', reset: 'Zurücksetzen', save: 'Speichern',
      saving: 'Speichere …', saved: 'Gespeichert ✔',
      rolesErr: 'Wähle mindestens eine Rolle (oder eine Bot-Rolle) aus.',
      timerErr: `Bei mehreren Rollen ist ein Timer von 1 bis ${MAX_TIMER} Sekunden Pflicht.`,
      timerRangeErr: `Der Timer darf höchstens ${MAX_TIMER} Sekunden betragen.`,
      badRole: (n) => `Der Bot kann die Rolle „${n}“ nicht vergeben (über der Bot-Rolle oder von einer Integration verwaltet).`,
      saveErr: 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
      noDb: 'Der Datenspeicher ist nicht eingerichtet oder nicht erreichbar.',
      badJson: 'Die Datei guild_data.json ist fehlerhaft und muss zuerst repariert werden.',
      loadErr: 'Die Einstellungen konnten nicht geladen werden.',
      apiMissing: 'Die Schnittstelle wurde nicht gefunden – diese Datei fehlt im Ordner api/ auf GitHub:',
      limit: `Maximal ${MAX_ROLES} Rollen.`,
    },
    en: {
      name: 'Join Roles', back: 'Back to dashboard',
      enable: 'Enable Join Roles', enableDesc: 'New members automatically receive roles.',
      roles: 'Roles', rolesHint: 'The order is the order of assignment: the first role immediately, each further role after the timer.',
      rolePh: 'Enter role name', noRole: 'No role found', none: '— None —', noneSelected: 'No role selected yet.',
      up: 'Move up', down: 'Move down', remove: 'Remove',
      reasonManaged: 'managed by an integration', reasonHierarchy: 'above the bot role', picked: '✓ selected',
      timer: 'Timer (in seconds)', timerHint: 'Wait time between the roles. Required as soon as you pick more than one role.', required: 'Required',
      bots: 'Bots', botsSwitch: 'Roles also apply to bots', botsSwitchDesc: 'Off: bots do not receive the roles above.',
      botRole: 'Role for bots only', botRoleHint: 'Bots receive this role immediately when they join (optional).',
      flow: 'Sequence', flowUsers: 'New members', flowBots: 'Bots', flowEmpty: 'No role',
      now: 'Immediately', after: (s) => `After ${s} ${s === 1 ? 'second' : 'seconds'}`,
      unsaved: 'Careful — you have unsaved changes!', reset: 'Reset', save: 'Save',
      saving: 'Saving …', saved: 'Saved ✔',
      rolesErr: 'Select at least one role (or a bot role).',
      timerErr: `With several roles a timer of 1 to ${MAX_TIMER} seconds is required.`,
      timerRangeErr: `The timer can be at most ${MAX_TIMER} seconds.`,
      badRole: (n) => `The bot cannot assign the role “${n}” (above the bot role or managed by an integration).`,
      saveErr: 'Saving failed. Please try again.',
      noDb: 'The data storage is not set up or not reachable.',
      badJson: 'The file guild_data.json is broken and has to be fixed first.',
      loadErr: 'The settings could not be loaded.',
      apiMissing: 'The endpoint was not found – this file is missing from the api/ folder on GitHub:',
      limit: `At most ${MAX_ROLES} roles.`,
    },
  }[lang];

  const ME = window.ME || fetch('/api/me').then(r => (r.ok ? r.json() : null)).then(d => (d && d.user) || null).catch(() => null);

  // IDs: entweder /USER_ID/GUILD_ID/joinroles oder /joinroles?uid=USER_ID&gid=GUILD_ID
  const parts = location.pathname.split('/').filter(Boolean);
  const qs = new URLSearchParams(location.search);
  const [uid, gid] = parts.length >= 3 ? parts : [qs.get('uid'), qs.get('gid')];
  const validIds = /^\d+$/.test(uid || '') && /^\d+$/.test(gid || '');
  $('#title').append(L.name);
  const msg = $('#msg');
  const app = $('#app');

  // Platzhalter sofort, Daten GLEICHZEITIG mit der Login-Prüfung
  const sk = (w) => make('div', { className: 'sk-line', style: `width:${w}` });
  app.replaceChildren(...[0, 1, 2].map(() => make('section', { className: 'cfg-card' },
    sk('35%'), make('div', { style: 'height:14px' }), sk('90%'), make('div', { style: 'height:10px' }), sk('65%'))));
  const q = `uid=${uid}&gid=${gid}`;
  const dataP = validIds ? fetch(`/api/joinroles?${q}`, { cache: 'no-store' }).catch(() => null) : null;

  const me = await ME;
  if (!me) return location.replace('/verify');
  if (!validIds || me.id !== uid) return location.replace(`/${me.id}/guilds`);
  $('#back').href = `/${uid}/${gid}`;
  $('#back').textContent = L.back;

  const fail = async (res, what) => {
    let code = null, detail = '';
    try { const j = await res.clone().json(); code = j.error; detail = j.detail || ''; } catch {}
    const more = detail ? ` – ${detail}` : '';
    const st = res ? res.status : 0;
    if (st === 401) msg.textContent = t('guilds_expired');
    else if (st === 403) msg.textContent = t('guilds_forbidden');
    else if (st === 404 && code === 'no_bot') msg.textContent = t('dash_nobot');
    else if (st === 503) msg.textContent = `${L.noDb}${more}`;
    else if (st === 422) msg.textContent = L.badJson;
    else if (st === 404) msg.textContent = `${L.apiMissing} (/api/${what})`;
    else msg.textContent = `${L.loadErr} (/api/${what}: ${st || 'keine Antwort'}${more})`;
  };

  const wr = await dataP;
  if (!wr || !wr.ok) { app.replaceChildren(); return fail(wr, 'joinroles'); }
  const data = await wr.json();
  const roles = data.roles;
  const byId = Object.fromEntries(roles.map(r => [r.id, r]));
  app.replaceChildren();

  // ---------- Zustand ----------
  const defaults = () => ({ enabled: false, roles: [], timer: 5, applyToBots: false, botRole: '' });
  const norm = (c) => {
    const m = { ...defaults(), ...(c || {}) };
    m.enabled = m.enabled === true;
    m.applyToBots = m.applyToBots === true;
    m.roles = Array.isArray(m.roles) ? m.roles.filter(id => byId[id]).slice(0, MAX_ROLES) : [];   // gelöschte Rollen verschwinden
    if (!byId[m.botRole]) m.botRole = '';
    m.timer = Number.isInteger(m.timer) ? m.timer : 5;
    return m;
  };
  let saved = norm(data.config);
  let cur = clone(saved);

  // Gleiche Regeln wie im Bot (bot/events/joinRoles.js)
  const plan = (cfg, isBot) => {
    const timer = Math.min(Math.max(parseInt(cfg.timer, 10) || 0, 0), MAX_TIMER);
    const steps = [];
    if (isBot && cfg.botRole) steps.push({ at: 0, id: cfg.botRole });
    if (!isBot || cfg.applyToBots) cfg.roles.forEach((id, i) => steps.push({ at: i * timer, id }));
    const seen = new Set();
    return steps.sort((a, b) => a.at - b.at).filter(s => (seen.has(s.id) ? false : seen.add(s.id)));
  };

  // ---------- Bausteine ----------
  const refs = {};
  const colorOf = (r) => (r && r.color ? '#' + r.color.toString(16).padStart(6, '0') : '#99aab5');
  const dot = (r) => { const d = make('span', { className: 'role-dot' }); d.style.background = colorOf(r); return d; };
  const sw = (onChange) => {
    const input = make('input', { type: 'checkbox' });
    input.addEventListener('change', () => onChange(input.checked));
    return { input, el: make('label', { className: 'switch' }, input, make('span', { className: 'slider' })) };
  };
  const reasonText = (r) => (r.reason === 'managed' ? L.reasonManaged : L.reasonHierarchy);

  // Auswahlfeld mit Suche. multi = Rolle wird einer Liste hinzugefügt, sonst genau eine Rolle (mit "Keine")
  const roleBox = ({ multi, selected, pick }) => {
    const input = make('input', { className: 'input', type: 'text', placeholder: L.rolePh, autocomplete: 'off' });
    const list = make('div', { className: 'combo-list' });
    list.hidden = true;
    const showSelected = () => { const r = !multi && byId[selected()]; input.value = r ? r.name : ''; };
    const renderList = (query = '') => {
      list.replaceChildren();
      const ql = query.toLowerCase();
      if (!multi && !ql) {
        const o = make('div', { className: 'combo-opt' + (selected() ? '' : ' sel') }, make('span', { textContent: L.none }));
        o.addEventListener('mousedown', (e) => { e.preventDefault(); pick(''); showSelected(); list.hidden = true; input.blur(); });
        list.append(o);
      }
      const found = roles.filter(r => r.name.toLowerCase().includes(ql));
      if (!found.length) { list.append(make('div', { className: 'combo-empty', textContent: L.noRole })); return; }
      found.forEach(r => {
        const taken = multi && cur.roles.includes(r.id);
        const dis = !r.assignable || taken;
        const note = !r.assignable ? reasonText(r) : (taken ? L.picked : '');
        const o = make('div', { className: 'combo-opt' + (dis ? ' dis' : '') + (!multi && r.id === selected() ? ' sel' : '') },
          make('span', { className: 'nm' }, dot(r), r.name), ...(note ? [make('small', { textContent: note })] : []));
        o.addEventListener('mousedown', (e) => {
          e.preventDefault();
          if (dis) return;
          pick(r.id); showSelected(); list.hidden = true; input.blur();
        });
        list.append(o);
      });
    };
    input.addEventListener('focus', () => { input.select(); renderList(); list.hidden = false; });
    input.addEventListener('input', () => { renderList(input.value.trim()); list.hidden = false; });
    input.addEventListener('blur', () => { list.hidden = true; showSelected(); });
    return { el: make('div', { className: 'combo' }, input, list), sync: showSelected };
  };

  // ---------- Aufbau ----------
  const enSw = sw(v => { cur.enabled = v; changed(); });
  app.append(make('section', { className: 'cfg-card row' },
    make('div', {}, make('h3', { textContent: L.enable }), make('p', { className: 'hint', textContent: L.enableDesc })), enSw.el));

  refs.rolesBox = roleBox({
    multi: true, selected: () => '',
    pick: (id) => { if (cur.roles.length >= MAX_ROLES) { note = { text: L.limit, kind: 'err' }; return updateBar(); } cur.roles.push(id); changed(); },
  });
  refs.list = make('div', { className: 'rolelist' });
  app.append(make('section', { className: 'cfg-card' },
    make('h3', { textContent: L.roles }), make('p', { className: 'hint', textContent: L.rolesHint }), refs.rolesBox.el, refs.list));

  refs.timer = make('input', { className: 'input', type: 'number', min: 1, max: MAX_TIMER, step: 1 });
  refs.timer.addEventListener('input', () => { const n = parseInt(refs.timer.value, 10); cur.timer = Number.isFinite(n) ? n : 0; changed(); });
  refs.req = make('span', { className: 'tag must', textContent: L.required });
  app.append(make('section', { className: 'cfg-card' },
    make('h3', {}, L.timer, ' ', refs.req), make('p', { className: 'hint', textContent: L.timerHint }),
    make('div', { className: 'field' }, refs.timer)));

  const botSw = sw(v => { cur.applyToBots = v; changed(); });
  refs.botBox = roleBox({ multi: false, selected: () => cur.botRole, pick: (id) => { cur.botRole = id; changed(); } });
  app.append(make('section', { className: 'cfg-card' },
    make('h3', { textContent: L.bots }),
    make('div', { className: 'sub-head', style: 'border-top:0;margin-top:10px;padding-top:0' },
      make('div', {}, make('b', { textContent: L.botsSwitch }), make('p', { className: 'hint', textContent: L.botsSwitchDesc })), botSw.el),
    make('div', { className: 'sub-head' }, make('div', {}, make('b', { textContent: L.botRole }), make('p', { className: 'hint', textContent: L.botRoleHint }))),
    refs.botBox.el));

  refs.flow = make('div', { className: 'flow' });
  app.append(make('section', { className: 'cfg-card' }, make('h3', { textContent: L.flow }), refs.flow));

  // ---------- Zustand -> Oberfläche ----------
  const renderList = () => {
    refs.list.replaceChildren();
    if (!cur.roles.length) { refs.list.append(make('div', { className: 'hint', textContent: L.noneSelected })); return; }
    const btn = (label, title, disabled, fn) => {
      const b = make('button', { type: 'button', textContent: label, title, disabled });
      b.addEventListener('click', fn);
      return b;
    };
    const move = (i, d) => { const [x] = cur.roles.splice(i, 1); cur.roles.splice(i + d, 0, x); changed(); };
    cur.roles.forEach((id, i) => {
      const r = byId[id];
      refs.list.append(make('div', { className: 'rolerow' + (r.assignable ? '' : ' bad') },
        make('span', { className: 'no', textContent: `${i + 1}.` }),
        make('span', { className: 'nm' }, dot(r), r.name, ...(r.assignable ? [] : [make('small', { className: 'warn', textContent: ` – ${reasonText(r)}` })])),
        btn('↑', L.up, i === 0, () => move(i, -1)),
        btn('↓', L.down, i === cur.roles.length - 1, () => move(i, 1)),
        btn('✕', L.remove, false, () => { cur.roles.splice(i, 1); changed(); })));
    });
  };

  const renderFlow = () => {
    refs.flow.replaceChildren();
    refs.flow.classList.toggle('dim', !cur.enabled);
    const section = (title, steps) => {
      refs.flow.append(make('div', { className: 'flow-title', textContent: title }));
      if (!steps.length) { refs.flow.append(make('div', { className: 'hint', textContent: L.flowEmpty })); return; }
      steps.forEach(s => refs.flow.append(make('div', { className: 'tl-row' },
        make('span', { className: 'tl-at', textContent: s.at === 0 ? L.now : L.after(s.at) }),
        make('span', { className: 'nm' }, dot(byId[s.id]), byId[s.id].name))));
    };
    section(L.flowUsers, plan(cur, false));
    section(L.flowBots, plan(cur, true));
  };

  const sync = () => {
    enSw.input.checked = cur.enabled; botSw.input.checked = cur.applyToBots;
    refs.timer.value = cur.timer; refs.botBox.sync(); refs.rolesBox.sync();
  };

  // ---------- Speichern-Leiste ----------
  const bar = $('#savebar');
  const barMsg = make('span', { className: 'bar-msg' });
  const resetBtn = make('button', { className: 'btn ghost', type: 'button', textContent: L.reset });
  const saveBtn = make('button', { className: 'btn', type: 'button', textContent: L.save });
  bar.append(barMsg, resetBtn, saveBtn);
  let note = null;

  const dirty = () => JSON.stringify(cur) !== JSON.stringify(saved);
  const updateBar = () => {
    const d = dirty();
    bar.classList.toggle('show', d || !!note);
    bar.classList.toggle('only-msg', !!note && note.kind === 'ok');
    barMsg.className = 'bar-msg' + (note ? ' ' + note.kind : '');
    barMsg.textContent = note ? note.text : L.unsaved;
  };
  const changed = () => {
    if (note && note.kind === 'err') note = null;
    refs.req.hidden = cur.roles.length < 2;          // Timer-Pflicht nur bei mehreren Rollen
    renderList(); renderFlow(); updateBar();
  };

  const validate = () => {
    if (cur.timer > MAX_TIMER || cur.timer < 0) return L.timerRangeErr;
    for (const id of [...cur.roles, ...(cur.botRole ? [cur.botRole] : [])]) if (!byId[id].assignable) return L.badRole(byId[id].name);
    if (cur.enabled) {
      if (!cur.roles.length && !cur.botRole) return L.rolesErr;
      if (cur.roles.length >= 2 && cur.timer < 1) return L.timerErr;
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
      const r = await fetch(`/api/joinroles?${q}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cur) });
      let j = {}; try { j = await r.clone().json(); } catch {}
      const more = j.detail ? ` – ${j.detail}` : '';
      if (r.status === 401) note = { text: t('guilds_expired'), kind: 'err' };
      else if (r.status === 503) note = { text: `${L.noDb}${more}`, kind: 'err' };
      else if (r.status === 422) note = { text: L.badJson, kind: 'err' };
      else if (r.status === 400 && j.error === 'timer_required') note = { text: L.timerErr, kind: 'err' };
      else if (r.status === 400 && j.error === 'roles_required') note = { text: L.rolesErr, kind: 'err' };
      else if (r.status === 400 && j.error === 'role_unassignable') note = { text: L.badRole(j.role), kind: 'err' };
      else if (!r.ok) note = { text: `${L.saveErr}${more}`, kind: 'err' };
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
  refs.req.hidden = cur.roles.length < 2;
  renderList(); renderFlow(); updateBar();
})();
