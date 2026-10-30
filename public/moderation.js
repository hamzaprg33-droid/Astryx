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

  const L = {
    de: {
      name: 'Moderation', back: 'Zurück zum Dashboard',
      enable: 'Moderation aktivieren', enableDesc: 'Aktiviert Warn-, Kick- und Ban-Commands sowie Team-Einstellungen.',
      team: 'Teamrollen', teamHint: 'Rollen, die als Team gelten (z. B. Moderatoren).',
      lead: 'Leitungsrollen', leadHint: 'Rollen der Serverleitung (dürfen i. d. R. mehr).',
      dash: 'Dashboard-Berechtigungen', dashHint: 'Diese Rollen sehen den Server in der Serverliste und dürfen alle Module bearbeiten. Nur Inhaber/Administratoren können diese Liste ändern.',
      std: 'Standard-Teamrolle', stdHint: 'Eine Rolle, die als „Standardteamrolle“ gilt (z. B. für Command-Rechte).',
      rolePh: 'Rollennamen eingeben', noRole: 'Keine Rolle gefunden', none: '— Keine —', noneSelected: 'Noch keine Rolle ausgewählt.',
      picked: '✓ ausgewählt', reasonManaged: 'von Integration verwaltet', reasonHierarchy: 'über der Bot-Rolle',
      cmds: 'Commands', cmdsHint: 'Nur aktivierte Commands werden registriert (pro Server). Nach dem Speichern den Button „Commands registrieren“ nutzen.',
      reg: 'Commands registrieren', regWait: 'Bitte warten …', regOk: 'Commands aktualisiert ✔', regFail: 'Registrierung fehlgeschlagen.',
      regCooldown: 'Bitte warte noch ein paar Sekunden.', regUnsaved: 'Bitte zuerst speichern.',
      warn: '/warn', kick: '/kick', ban: '/ban',
      cmdOn: 'Command aktiv', reason: 'Grund', reasonReq: 'Pflicht', reasonOpt: 'Optional', reasonNone: 'Kein Grund',
      who: 'Wer darf nutzen', whoStd: 'Standardteamrolle', whoTeam: 'Team', whoLead: 'Leitungsteam', whoHigh: 'Hohe Ränge',
      whoHint: 'Hohe Ränge werden vom Bot automatisch anhand der Rollenhierarchie und Berechtigungen bestimmt.',
      banTime: 'Ban-Zeit', minTime: 'Mindestzeit', maxTime: 'Maximalzeit', permanent: 'Permanent erlauben',
      timeHint: 'Eingabe im Command z. B. 30m, 12h, 7d. Min/Max hier in Minuten festlegen (0 = kein Limit).',
      msgs: 'Nachrichten (bis zu 2 pro Command)', msgsHint: 'z. B. eine DM an den Nutzer und eine Bestätigung im Kanal. Leer lassen = keine Nachricht.',
      msgType: 'Typ', msgDm: 'DM an Nutzer', msgCh: 'Kanal-Nachricht',
      msgText: 'Text', msgEmbed: 'Embed', msgTitle: 'Titel', msgDesc: 'Beschreibung', msgColor: 'Farbe',
      addMsg: '+ Nachricht', remMsg: 'Entfernen',
      vars: 'Platzhalter: @user · <user_name> · <user_username> · <user_id> · {server} · {members} · {reason} · {moderator} · {duration}',
      unsaved: 'Vorsicht – du hast ungespeicherte Änderungen!', reset: 'Zurücksetzen', save: 'Speichern',
      saving: 'Speichere …', saved: 'Gespeichert ✔',
      saveErr: 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
      noDb: 'Der Datenspeicher ist nicht eingerichtet oder nicht erreichbar.',
      badJson: 'Die Datei guild_data.json ist fehlerhaft und muss zuerst repariert werden.',
      loadErr: 'Die Einstellungen konnten nicht geladen werden.',
      apiMissing: 'Der Endpoint fehlt im api/-Ordner auf GitHub:',
      betaOnly: 'Dieses Modul ist aktuell nur für Beta-Tester verfügbar.',
    },
    en: {
      name: 'Moderation', back: 'Back to dashboard',
      enable: 'Enable Moderation', enableDesc: 'Enables warn, kick and ban commands plus team settings.',
      team: 'Team roles', teamHint: 'Roles that count as team (e.g. moderators).',
      lead: 'Leadership roles', leadHint: 'Server leadership roles (usually more permissions).',
      dash: 'Dashboard permissions', dashHint: 'These roles see the server in the server list and may edit all modules. Only owners/admins can change this list.',
      std: 'Default team role', stdHint: 'One role that counts as the “default team role” (e.g. for command permissions).',
      rolePh: 'Enter role name', noRole: 'No role found', none: '— None —', noneSelected: 'No role selected yet.',
      picked: '✓ selected', reasonManaged: 'managed by an integration', reasonHierarchy: 'above the bot role',
      cmds: 'Commands', cmdsHint: 'Only enabled commands are registered (per server). After saving, use the “Register commands” button.',
      reg: 'Register commands', regWait: 'Please wait …', regOk: 'Commands updated ✔', regFail: 'Registration failed.',
      regCooldown: 'Please wait a few more seconds.', regUnsaved: 'Please save first.',
      warn: '/warn', kick: '/kick', ban: '/ban',
      cmdOn: 'Command enabled', reason: 'Reason', reasonReq: 'Required', reasonOpt: 'Optional', reasonNone: 'No reason',
      who: 'Who can use', whoStd: 'Default team role', whoTeam: 'Team', whoLead: 'Leadership', whoHigh: 'High ranks',
      whoHint: 'High ranks are determined automatically by the bot from role hierarchy and permissions.',
      banTime: 'Ban duration', minTime: 'Minimum', maxTime: 'Maximum', permanent: 'Allow permanent',
      timeHint: 'In the command e.g. 30m, 12h, 7d. Set min/max here in minutes (0 = no limit).',
      msgs: 'Messages (up to 2 per command)', msgsHint: 'e.g. a DM to the user and a channel confirmation. Leave empty = no message.',
      msgType: 'Type', msgDm: 'DM to user', msgCh: 'Channel message',
      msgText: 'Text', msgEmbed: 'Embed', msgTitle: 'Title', msgDesc: 'Description', msgColor: 'Color',
      addMsg: '+ Message', remMsg: 'Remove',
      vars: 'Placeholders: @user · <user_name> · <user_username> · <user_id> · {server} · {members} · {reason} · {moderator} · {duration}',
      unsaved: 'Careful — you have unsaved changes!', reset: 'Reset', save: 'Save',
      saving: 'Saving …', saved: 'Saved ✔',
      saveErr: 'Saving failed. Please try again.',
      noDb: 'The data storage is not set up or not reachable.',
      badJson: 'The file guild_data.json is broken and has to be fixed first.',
      loadErr: 'The settings could not be loaded.',
      apiMissing: 'The endpoint is missing from the api/ folder on GitHub:',
      betaOnly: 'This module is currently only available to beta testers.',
    },
  }[lang];

  const qs = new URLSearchParams(location.search);
  let uid = qs.get('uid'), gid = qs.get('gid');
  if (!uid || !gid) {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
      uid = parts[0]; gid = parts[1];
    }
  }
  const validIds = /^\d+$/.test(uid || '') && /^\d+$/.test(gid || '');
  $('#back').href = validIds ? `/${uid}/${gid}` : '/';
  $('#back').textContent = L.back;
  $('#title').textContent = L.name;
  const msg = $('#msg');
  const app = $('#app');
  const savebar = $('#savebar');
  const regBtn = $('#regCmds');
  regBtn.textContent = L.reg;

  if (!validIds) {
    msg.textContent = L.loadErr;
    return;
  }

  // Login-Check (wie andere Module)
  const ME = window.ME || fetch('/api/me').then(r => (r.ok ? r.json() : null)).then(d => (d && d.user) || null).catch(() => null);
  const me = await ME;
  if (!me) return location.replace('/verify');
  if (me.id !== uid) return location.replace(`/${me.id}/guilds`);

  const q = `uid=${uid}&gid=${gid}`;
  const dataP = fetch(`/api/moderation?${q}`, { cache: 'no-store' }).catch(() => null);

  const fail = (r, name) => {
    if (!r) { msg.textContent = L.loadErr; return true; }
    if (r.status === 404) { msg.textContent = L.apiMissing + ' ' + name; return true; }
    if (r.status === 503) { msg.textContent = L.noDb; return true; }
    if (r.status === 422) { msg.textContent = L.badJson; return true; }
    if (r.status === 401) return location.replace('/verify');
    if (r.status === 403) { msg.textContent = t('guilds_forbidden'); return true; }
    msg.textContent = L.loadErr;
    return true;
  };

  const wr = await dataP;
  if (!wr || !wr.ok) { app.replaceChildren(); return fail(wr, 'moderation'); }
  const data = await wr.json();
  const roles = data.roles || [];
  const byId = Object.fromEntries(roles.map(r => [r.id, r]));
  const isOwnerOrAdmin = !!data.isOwnerOrAdmin;

  const emptyMsg = () => ({ type: 'dm', textEnabled: true, text: '', embedEnabled: false, embed: { title: '', description: '', color: '#E74C3C' } });
  const emptyCmd = (extra = {}) => ({
    enabled: false,
    reason: 'optional',
    who: ['team', 'leadership'],
    messages: [],
    ...extra,
  });
  const defaults = () => ({
    enabled: false,
    teamRoles: [],
    leadershipRoles: [],
    dashboardRoles: [],
    standardTeamRole: '',
    commands: {
      warn: emptyCmd(),
      kick: emptyCmd(),
      ban: emptyCmd({ minDuration: 0, maxDuration: 0, permanent: true }),
    },
  });
  const norm = (c) => {
    const d = defaults();
    const m = { ...d, ...(c || {}) };
    m.teamRoles = Array.isArray(m.teamRoles) ? m.teamRoles.filter(id => byId[id]) : [];
    m.leadershipRoles = Array.isArray(m.leadershipRoles) ? m.leadershipRoles.filter(id => byId[id]) : [];
    m.dashboardRoles = Array.isArray(m.dashboardRoles) ? m.dashboardRoles.filter(id => byId[id]) : [];
    if (!byId[m.standardTeamRole]) m.standardTeamRole = '';
    for (const k of ['warn', 'kick', 'ban']) {
      const src = (c && c.commands && c.commands[k]) || {};
      m.commands[k] = {
        ...emptyCmd(k === 'ban' ? { minDuration: 0, maxDuration: 0, permanent: true } : {}),
        ...src,
        who: Array.isArray(src.who) ? src.who : emptyCmd().who,
        messages: Array.isArray(src.messages) ? src.messages.slice(0, 2).map(x => ({ ...emptyMsg(), ...x, embed: { ...emptyMsg().embed, ...(x.embed || {}) } })) : [],
      };
      if (k === 'ban') {
        m.commands[k].minDuration = Math.max(0, parseInt(m.commands[k].minDuration, 10) || 0);
        m.commands[k].maxDuration = Math.max(0, parseInt(m.commands[k].maxDuration, 10) || 0);
        m.commands[k].permanent = m.commands[k].permanent !== false;
      }
    }
    return m;
  };

  let saved = norm(data.config);
  let cur = clone(saved);
  let dirty = false;
  let note = null;
  let lastReg = 0;

  const colorOf = (r) => {
    const n = typeof r.color === 'number' ? r.color : 0;
    return n ? '#' + n.toString(16).padStart(6, '0') : '#99aab5';
  };
  const dot = (r) => { const d = make('span', { className: 'role-dot' }); d.style.background = colorOf(r); return d; };
  const reasonText = (r) => (r.reason === 'managed' ? L.reasonManaged : L.reasonHierarchy);

  const sw = (onChange) => {
    const input = make('input', { type: 'checkbox' });
    input.addEventListener('change', () => onChange(input.checked));
    return { input, el: make('label', { className: 'switch' }, input, make('span', { className: 'slider' })) };
  };

  const roleBox = ({ multi, selected, pick, listGetter }) => {
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
      const takenSet = multi ? new Set(listGetter()) : null;
      const found = roles.filter(r => r.name.toLowerCase().includes(ql));
      if (!found.length) { list.append(make('div', { className: 'combo-empty', textContent: L.noRole })); return; }
      found.forEach(r => {
        const taken = multi && takenSet.has(r.id);
        const dis = !r.assignable || taken;
        const note2 = !r.assignable ? reasonText(r) : (taken ? L.picked : '');
        const o = make('div', { className: 'combo-opt' + (dis ? ' dis' : '') + (!multi && r.id === selected() ? ' sel' : '') },
          make('span', { className: 'nm' }, dot(r), r.name), ...(note2 ? [make('small', { textContent: note2 })] : []));
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

  const changed = () => {
    dirty = JSON.stringify(cur) !== JSON.stringify(saved);
    updateBar();
    regBtn.disabled = dirty;
    regBtn.style.opacity = dirty ? '0.5' : '1';
  };

  const updateBar = () => {
    savebar.replaceChildren();
    if (note) {
      savebar.append(make('span', { className: 'note ' + (note.kind || ''), textContent: note.text }));
    } else if (dirty) {
      savebar.append(make('span', { className: 'note warn', textContent: L.unsaved }));
    }
    const reset = make('button', { type: 'button', className: 'btn', textContent: L.reset, disabled: !dirty });
    reset.addEventListener('click', () => { cur = clone(saved); note = null; dirty = false; render(); updateBar(); });
    const save = make('button', { type: 'button', className: 'btn primary', textContent: L.save, disabled: !dirty });
    save.addEventListener('click', doSave);
    savebar.append(reset, save);
    savebar.classList.toggle('show', dirty || !!note);
  };

  async function doSave() {
    note = { text: L.saving, kind: '' };
    updateBar();
    try {
      const r = await fetch(`/api/moderation?${q}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cur),
      });
      if (!r.ok) {
        note = { text: L.saveErr, kind: 'err' };
        updateBar();
        return;
      }
      const j = await r.json();
      saved = norm(j.config || cur);
      cur = clone(saved);
      note = { text: L.saved, kind: 'ok' };
      dirty = false;
      render();
      updateBar();
      setTimeout(() => { if (note && note.kind === 'ok') { note = null; updateBar(); } }, 2500);
    } catch {
      note = { text: L.saveErr, kind: 'err' };
      updateBar();
    }
  }

  regBtn.style.display = 'inline-block';
  regBtn.addEventListener('click', async () => {
    if (dirty) { note = { text: L.regUnsaved, kind: 'err' }; updateBar(); return; }
    const now = Date.now();
    if (now - lastReg < 10000) { note = { text: L.regCooldown, kind: 'err' }; updateBar(); return; }
    lastReg = now;
    regBtn.disabled = true;
    regBtn.textContent = L.regWait;
    note = null;
    updateBar();
    try {
      const r = await fetch(`/api/moderation?${q}&action=register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!r.ok) throw new Error();
      note = { text: L.regOk, kind: 'ok' };
    } catch {
      note = { text: L.regFail, kind: 'err' };
    }
    regBtn.disabled = false;
    regBtn.textContent = L.reg;
    updateBar();
    setTimeout(() => { if (note && note.kind === 'ok') { note = null; updateBar(); } }, 3000);
  });

  const refs = {};

  function renderRoleList(key, listEl) {
    listEl.replaceChildren();
    const arr = cur[key];
    if (!arr.length) {
      listEl.append(make('div', { className: 'hint', textContent: L.noneSelected }));
      return;
    }
    arr.forEach((id, i) => {
      const r = byId[id];
      if (!r) return;
      const row = make('div', { className: 'role-row' },
        make('span', { className: 'nm' }, dot(r), r.name),
        make('button', { type: 'button', className: 'btn sm', textContent: '×', title: 'Entfernen' }));
      row.querySelector('button').addEventListener('click', () => {
        cur[key] = cur[key].filter(x => x !== id);
        changed();
        render();
      });
      listEl.append(row);
    });
  }

  function renderCmd(key, title) {
    const cmd = cur.commands[key];
    const sec = make('section', { className: 'cfg-card' });
    const en = sw(v => { cmd.enabled = v; changed(); render(); });
    en.input.checked = cmd.enabled;
    sec.append(make('div', { className: 'sub-head', style: 'border:0;margin:0;padding:0' },
      make('div', {}, make('h3', { textContent: title })), en.el));

    if (!cmd.enabled) return sec;

    // Reason
    const reasonSel = make('select', { className: 'input' });
    [['required', L.reasonReq], ['optional', L.reasonOpt], ['none', L.reasonNone]].forEach(([v, lab]) => {
      reasonSel.append(make('option', { value: v, textContent: lab, selected: cmd.reason === v }));
    });
    reasonSel.addEventListener('change', () => { cmd.reason = reasonSel.value; changed(); });
    sec.append(make('div', { className: 'field', style: 'margin-top:14px' },
      make('label', { textContent: L.reason }), reasonSel));

    // Who
    const whoBox = make('div', { className: 'who-grid' });
    const whoOpts = [
      ['standard', L.whoStd],
      ['team', L.whoTeam],
      ['leadership', L.whoLead],
      ['high', L.whoHigh],
    ];
    whoOpts.forEach(([v, lab]) => {
      const cb = make('input', { type: 'checkbox', checked: cmd.who.includes(v) });
      cb.addEventListener('change', () => {
        if (cb.checked) { if (!cmd.who.includes(v)) cmd.who.push(v); }
        else cmd.who = cmd.who.filter(x => x !== v);
        changed();
      });
      whoBox.append(make('label', { className: 'chk' }, cb, make('span', { textContent: lab })));
    });
    sec.append(make('div', { className: 'field' }, make('label', { textContent: L.who }), make('p', { className: 'hint', textContent: L.whoHint }), whoBox));

    // Ban extras
    if (key === 'ban') {
      const minI = make('input', { className: 'input', type: 'number', min: 0, value: cmd.minDuration });
      const maxI = make('input', { className: 'input', type: 'number', min: 0, value: cmd.maxDuration });
      minI.addEventListener('input', () => { cmd.minDuration = Math.max(0, parseInt(minI.value, 10) || 0); changed(); });
      maxI.addEventListener('input', () => { cmd.maxDuration = Math.max(0, parseInt(maxI.value, 10) || 0); changed(); });
      const permSw = sw(v => { cmd.permanent = v; changed(); });
      permSw.input.checked = cmd.permanent;
      sec.append(make('div', { className: 'field' },
        make('label', { textContent: L.banTime }), make('p', { className: 'hint', textContent: L.timeHint }),
        make('div', { className: 'row-2' },
          make('div', {}, make('small', { textContent: L.minTime }), minI),
          make('div', {}, make('small', { textContent: L.maxTime }), maxI)),
        make('div', { className: 'sub-head' }, make('div', {}, make('b', { textContent: L.permanent })), permSw.el)));
    }

    // Messages (up to 2)
    sec.append(make('h4', { style: 'margin-top:18px', textContent: L.msgs }));
    sec.append(make('p', { className: 'hint', textContent: L.msgsHint }));
    sec.append(make('p', { className: 'hint', textContent: L.vars }));
    const msgsEl = make('div', { className: 'msg-list' });
    const drawMsgs = () => {
      msgsEl.replaceChildren();
      cmd.messages.forEach((m, i) => {
        const box = make('div', { className: 'msg-box' });
        const typeSel = make('select', { className: 'input' });
        [['dm', L.msgDm], ['channel', L.msgCh]].forEach(([v, lab]) => {
          typeSel.append(make('option', { value: v, textContent: lab, selected: m.type === v }));
        });
        typeSel.addEventListener('change', () => { m.type = typeSel.value; changed(); });
        const rem = make('button', { type: 'button', className: 'btn sm', textContent: L.remMsg });
        rem.addEventListener('click', () => { cmd.messages.splice(i, 1); changed(); drawMsgs(); });
        box.append(make('div', { className: 'row-2' }, make('div', {}, make('small', { textContent: L.msgType }), typeSel), rem));

        const textSw = sw(v => { m.textEnabled = v; changed(); drawMsgs(); });
        textSw.input.checked = m.textEnabled;
        box.append(make('div', { className: 'sub-head' }, make('div', {}, make('b', { textContent: L.msgText })), textSw.el));
        if (m.textEnabled) {
          const ta = make('textarea', { className: 'input', rows: 3, value: m.text || '' });
          ta.addEventListener('input', () => { m.text = ta.value; changed(); });
          box.append(ta);
        }

        const embSw = sw(v => { m.embedEnabled = v; changed(); drawMsgs(); });
        embSw.input.checked = m.embedEnabled;
        box.append(make('div', { className: 'sub-head' }, make('div', {}, make('b', { textContent: L.msgEmbed })), embSw.el));
        if (m.embedEnabled) {
          const ti = make('input', { className: 'input', value: m.embed.title || '', placeholder: L.msgTitle });
          const de = make('textarea', { className: 'input', rows: 3, value: m.embed.description || '', placeholder: L.msgDesc });
          const co = make('input', { className: 'input', value: m.embed.color || '#E74C3C', placeholder: '#E74C3C' });
          ti.addEventListener('input', () => { m.embed.title = ti.value; changed(); });
          de.addEventListener('input', () => { m.embed.description = de.value; changed(); });
          co.addEventListener('input', () => { m.embed.color = co.value; changed(); });
          box.append(ti, de, make('div', { className: 'field' }, make('small', { textContent: L.msgColor }), co));
        }
        msgsEl.append(box);
      });
      if (cmd.messages.length < 2) {
        const add = make('button', { type: 'button', className: 'btn', textContent: L.addMsg });
        add.addEventListener('click', () => { cmd.messages.push(emptyMsg()); changed(); drawMsgs(); });
        msgsEl.append(add);
      }
    };
    drawMsgs();
    sec.append(msgsEl);
    return sec;
  }

  function render() {
    app.replaceChildren();

    // Enable
    const enSw = sw(v => { cur.enabled = v; changed(); render(); });
    enSw.input.checked = cur.enabled;
    app.append(make('section', { className: 'cfg-card row' },
      make('div', {}, make('h3', { textContent: L.enable }), make('p', { className: 'hint', textContent: L.enableDesc })), enSw.el));

    if (!cur.enabled) {
      updateBar();
      return;
    }

    // Team roles
    const teamList = make('div', { className: 'rolelist' });
    const teamBox = roleBox({
      multi: true,
      selected: () => '',
      listGetter: () => cur.teamRoles,
      pick: (id) => { if (!cur.teamRoles.includes(id)) cur.teamRoles.push(id); changed(); render(); },
    });
    app.append(make('section', { className: 'cfg-card' },
      make('h3', { textContent: L.team }), make('p', { className: 'hint', textContent: L.teamHint }),
      teamBox.el, teamList));
    renderRoleList('teamRoles', teamList);

    // Leadership
    const leadList = make('div', { className: 'rolelist' });
    const leadBox = roleBox({
      multi: true,
      selected: () => '',
      listGetter: () => cur.leadershipRoles,
      pick: (id) => { if (!cur.leadershipRoles.includes(id)) cur.leadershipRoles.push(id); changed(); render(); },
    });
    app.append(make('section', { className: 'cfg-card' },
      make('h3', { textContent: L.lead }), make('p', { className: 'hint', textContent: L.leadHint }),
      leadBox.el, leadList));
    renderRoleList('leadershipRoles', leadList);

    // Standard team role
    const stdBox = roleBox({
      multi: false,
      selected: () => cur.standardTeamRole,
      pick: (id) => { cur.standardTeamRole = id; changed(); },
    });
    app.append(make('section', { className: 'cfg-card' },
      make('h3', { textContent: L.std }), make('p', { className: 'hint', textContent: L.stdHint }), stdBox.el));
    stdBox.sync();

    // Dashboard permissions (only owner/admin can change)
    const dashList = make('div', { className: 'rolelist' });
    if (isOwnerOrAdmin) {
      const dashBox = roleBox({
        multi: true,
        selected: () => '',
        listGetter: () => cur.dashboardRoles,
        pick: (id) => { if (!cur.dashboardRoles.includes(id)) cur.dashboardRoles.push(id); changed(); render(); },
      });
      app.append(make('section', { className: 'cfg-card' },
        make('h3', { textContent: L.dash }), make('p', { className: 'hint', textContent: L.dashHint }),
        dashBox.el, dashList));
      renderRoleList('dashboardRoles', dashList);
    } else {
      app.append(make('section', { className: 'cfg-card' },
        make('h3', { textContent: L.dash }), make('p', { className: 'hint', textContent: L.dashHint }),
        make('div', { className: 'hint', textContent: (cur.dashboardRoles.map(id => byId[id]?.name).filter(Boolean).join(', ') || L.noneSelected) })));
    }

    // Commands
    app.append(make('section', { className: 'cfg-card' },
      make('h3', { textContent: L.cmds }), make('p', { className: 'hint', textContent: L.cmdsHint })));
    app.append(renderCmd('warn', L.warn));
    app.append(renderCmd('kick', L.kick));
    app.append(renderCmd('ban', L.ban));

    updateBar();
  }

  render();
})();
