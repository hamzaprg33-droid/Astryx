(async () => {
  const { t, lang } = window.I18N;
  const P = window.PLACEHOLDERS;
  const F = window.FEATURES;
  const $ = (s) => document.querySelector(s);
  const el = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => { if (k !== null && k !== undefined && k !== false) e.append(k); });
    return e;
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));

  const MAXT = 100;
  const MAXA = 10;   // Automatisierungen pro Server
  const LIM = { content: 2000, embeds: 10, embedTotal: 6000, fields: 25, rows: 5, buttons: 5, options: 25, actions: 5, roles: 10 };
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const ID = /^[a-z0-9]{4,12}$/;
  const STYLES = ['primary', 'secondary', 'success', 'danger'];
  const LINK = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/channels\/(\d{1,25})\/(\d{1,25})\/(\d{1,25})\/?$/;

  const L = {
    de: {
      title: 'Eigene Nachrichten', back: 'Zurück zum Dashboard',
      intro: 'Erstelle eigene Nachrichten mit Text, Embeds, Buttons und Auswahlmenüs und sende sie jederzeit in einen Kanal. Klicke auf eine Vorlage, um sie zu bearbeiten.',
      search: 'Vorlagen suchen…', create: 'Neue Vorlage erstellen', empty: 'Noch keine Vorlagen. Erstelle deine erste!', noHit: 'Keine Vorlage gefunden.',
      open: 'Öffnen', del: 'Löschen', delTitle: 'Vorlage löschen', delText: (n) => `Soll die Vorlage „${n}“ wirklich gelöscht werden? Bereits gesendete Nachrichten mit Buttons funktionieren danach nicht mehr.`,
      cancel: 'Abbrechen', add: 'Hinzufügen', back2: 'Zurück', discard: 'Verwerfen', yesDelete: 'Löschen',
      discardTitle: 'Ungespeicherte Änderungen', discardText: 'Wenn du jetzt schließt, gehen deine Änderungen verloren.',
      createTitle: 'Vorlage erstellen', createText: 'Gib einen Namen für die Vorlage ein.', nameLabel: 'Neuer Vorlagenname',
      nameErr: 'Bitte gib einen Namen ein (höchstens 40 Zeichen).', nameTaken: 'Diesen Namen gibt es schon.', limitErr: `Es sind höchstens ${MAXT} Vorlagen möglich.`,
      tabs: { edit: 'Bearbeiten', preview: 'Vorschau', use: 'Verwenden' }, subs: { visual: 'Visuell', raw: 'Raw', vars: 'Variablen' },
      botName: 'Astryx', botTag: 'BOT',
      defaultText: '**Neue Vorlage erstellt!**\n\n**Und jetzt?**\n> - Wechsle zum Tab „Bearbeiten“, um die Nachricht zu ändern.\n> - Wechsle zum Tab „Verwenden“, um sie in einen Kanal zu senden.',
      contentPh: 'Nachrichtentext – Markdown wird unterstützt (**fett**, *kursiv*, `Code`, > Zitat)',
      addEmbed: 'Embed', addRow: 'Aktionszeile', clear: 'Leeren', clearTitle: 'Nachricht leeren', clearText: 'Text, Embeds und Aktionszeilen dieser Vorlage werden entfernt.', clearYes: 'Leeren',
      embed: 'Embed', eAuthor: 'Autor', eTitle: 'Titel', eDesc: 'Beschreibung', eColor: 'Farbe (Hex)', eThumb: 'Thumbnail-Adresse', eImage: 'Bild-Adresse', eFooter: 'Footer',
      fields: 'Felder', addField: 'Feld', fName: 'Name', fValue: 'Wert', fInline: 'Nebeneinander',
      row: 'Aktionszeile', addButton: 'Button', addSelect: 'Auswahlmenü', btnLabel: 'Beschriftung', btnStyle: 'Farbe', btnDefault: 'Button', optDefault: 'Option',
      styles: { primary: 'Blau', secondary: 'Grau', success: 'Grün', danger: 'Rot' },
      selPh: 'Platzhaltertext', selMin: 'Mindestens', selMax: 'Höchstens', options: 'Optionen', addOption: 'Option', optLabel: 'Beschriftung', optDesc: 'Beschreibung (optional)', menu: 'Auswahlmenü',
      actions: 'Aktionen', addAction: 'Aktion', noActions: 'Ohne Aktion passiert beim Klick nichts.',
      actTypes: { role_add: 'Rolle(n) vergeben', role_remove: 'Rolle(n) entfernen', message: 'Nachricht senden' },
      rolePh: 'Rolle hinzufügen…', noRole: 'Keine Rolle gefunden', picked: '✓ ausgewählt', reasonManaged: 'von Integration verwaltet', reasonHierarchy: 'über der Bot-Rolle',
      msgText: 'Nachricht', mEphemeral: 'Nur für den Nutzer sichtbar', mDm: 'Als Direktnachricht', remove: 'Entfernen',
      rawApply: 'Übernehmen', rawOk: 'Übernommen ✔', rawErr: (m) => `Das ist kein gültiges JSON oder keine gültige Nachricht: ${m}`, rawObj: 'Es muss ein Objekt sein.',
      varsIntro: 'Platzhalter in Texten. Sie werden an der Stelle ersetzt, an der sie gelten.',
      varsHead: ['Platzhalter', 'Bedeutung', 'Beispiel'],
      vars: [['@user', 'Erwähnung des Nutzers', '@Astryx Bot'], ['<user_name>', 'Anzeigename', 'Astryx Bot'], ['<user_username>', 'Benutzername (mit #Tag, falls vorhanden)', 'Astryx Bot#3513'], ['<user_id>', 'Discord-ID', '1555467302282207272'], ['{server}', 'Name des Servers', 'Magdeburg RP'], ['{members}', 'Anzahl der Mitglieder', '128']],
      varsWhere: 'Die Nutzer-Platzhalter (@user, <user_name>, <user_username>, <user_id>) gelten in Nachrichten, die durch einen Button oder ein Menü ausgelöst werden, und im Willkommer. {server} und {members} gelten auch in der gesendeten Nachricht selbst.',
      previewEmpty: 'Die Nachricht ist leer.', menuPh: 'Wähle eine Option…',
      useTabs: { send: 'Senden', edit: 'Bearbeiten', schedule: 'Planen', automate: 'Automatisieren', sticky: 'Anheften' }, soon: 'Bald verfügbar',
      autoIntro: 'Sende diese Vorlage automatisch immer wieder – im gewählten Abstand.',
      interval: 'Intervall', custom: 'Eigener Wert', customHours: 'Stunden', customDays: 'Tage',
      intervalErr: 'Das Intervall muss zwischen 1 Stunde und 30 Tagen liegen.',
      autoNote: 'Der erste Versand erfolgt nach Ablauf des Intervalls, danach immer im gleichen Abstand. Der Bot muss dafür online sein.',
      autoBtn: 'Automatisierung starten', autoStarting: 'Starte …', autoStarted: (w) => `Automatisierung gestartet ✔ – erster Versand: ${w}`,
      autoActive: 'Aktive Automatisierungen', autoNone: 'Für diese Vorlage läuft noch keine Automatisierung.', autoCount: (n) => `${n} / ${MAXA} auf diesem Server`,
      every: (m) => (m % 1440 === 0 ? (m === 1440 ? 'jeden Tag' : `alle ${m / 1440} Tage`) : m % 60 === 0 ? (m === 60 ? 'jede Stunde' : `alle ${m / 60} Stunden`) : `alle ${m} Minuten`),
      next: (w) => `Nächster Versand: ${w}`, stop: 'Beenden', webhookTarget: (id) => `Webhook ${id}`,
      stopTitle: 'Automatisierung beenden', stopText: 'Danach wird diese Nachricht nicht mehr automatisch gesendet.', stopYes: 'Beenden',
      editIntro: 'Bearbeite eine bereits gesendete Nachricht des Bots mit dieser Vorlage.',
      linkLabel: 'Nachrichtenlink', linkPh: 'https://discord.com/channels/…', linkHelp: 'So bekommst du ihn: Rechtsklick auf die Nachricht → „Nachrichtenlink kopieren“.',
      editWarn: 'Das funktioniert nicht bei Nachrichten, die über einen Webhook gesendet wurden. Der Bot kann nur Nachrichten bearbeiten, die er selbst gesendet hat.',
      editBtn: 'Nachricht bearbeiten', editing: 'Bearbeite …', edited: 'Bearbeitet ✔',
      linkInvalid: 'Das ist kein gültiger Nachrichtenlink.', linkOtherServer: 'Dieser Link gehört zu einem anderen Server.',
      useIntro: 'Sende diese Vorlage in einen Kanal.', channel: 'Kanal', channelPh: 'Kanalnamen eingeben', noChannel: 'Kein Kanal gefunden',
      webhook: 'Webhook', webhookPh: 'https://discord.com/api/webhooks/…', webhookHint: 'Über Webhook gesendet: ohne Buttons und Menüs, dafür mit „Powered by Astryx“.',
      sendBtn: 'Nachricht senden', saveFirst: 'Speichere zuerst deine Änderungen, bevor du sendest.', sending: 'Sende …', sent: 'Gesendet ✔', openMsg: 'Nachricht öffnen',
      sErr: { interval_invalid: 'Das Intervall muss zwischen 1 Stunde und 30 Tagen liegen.', too_many_autos: 'Auf diesem Server laufen schon 10 Automatisierungen – beende eine, um eine neue zu starten.', no_permission: 'Der Bot darf in diesem Kanal nicht schreiben oder lesen (Rechte „Kanal ansehen“, „Nachrichtenverlauf lesen“, „Nachrichten senden“ und „Links einbetten“ prüfen).', link_invalid: 'Das ist kein gültiger Nachrichtenlink.', link_wrong_server: 'Dieser Link gehört zu einem anderen Server.', message_unknown: 'Diese Nachricht wurde nicht gefunden (gelöscht, oder der Bot kann den Kanal nicht sehen).', webhook_message: 'Diese Nachricht wurde über einen Webhook gesendet. Webhook-Nachrichten kann der Bot nicht bearbeiten.', not_bot_message: 'Diese Nachricht stammt nicht vom Bot. Der Bot kann nur seine eigenen Nachrichten bearbeiten.', channel_unknown: 'Dieser Kanal existiert nicht (mehr).', webhook_invalid: 'Das ist keine gültige Discord-Webhook-Adresse.', webhook_unknown: 'Dieser Webhook existiert nicht (mehr) oder die Adresse ist falsch.', empty_message: 'Die Nachricht ist leer – füge Text oder ein Embed mit Inhalt hinzu.', rate_limited: 'Discord bremst gerade. Bitte warte kurz und versuche es erneut.', too_long: 'Der Text ist mit der „Powered by Astryx“-Zeile zu lang (höchstens 2000 Zeichen).', template_missing: 'Die Vorlage ist nicht gespeichert.' },
      unsaved: 'Vorsicht – du hast ungespeicherte Änderungen!', reset: 'Zurücksetzen', save: 'Speichern', saving2: 'Speichere …', saved: 'Gespeichert ✔',
      c: {
        content: `Der Text ist zu lang (höchstens ${LIM.content} Zeichen).`, embeds: `Höchstens ${LIM.embeds} Embeds.`, total: `Alle Embeds zusammen dürfen höchstens ${LIM.embedTotal} Zeichen haben.`,
        color: (n) => `Embed ${n}: ungültige Farbe (Beispiel: #2ECC71).`, url: (n) => `Embed ${n}: Adressen müssen mit https:// beginnen.`, field: (n) => `Embed ${n}: Felder brauchen einen Namen und einen Wert.`,
        rowEmpty: (n) => `Aktionszeile ${n} ist leer – füge einen Button oder ein Menü hinzu oder lösche sie.`, label: (n) => `Aktionszeile ${n}: Jeder Button und jede Option braucht eine Beschriftung.`,
        action: (n, x) => `Aktionszeile ${n}: „${x}“ braucht mindestens eine Aktion.`, roles: (n, x) => `Aktionszeile ${n}: „${x}“ – wähle mindestens eine Rolle.`, text: (n, x) => `Aktionszeile ${n}: „${x}“ – die Nachricht darf nicht leer sein.`,
        badRole: (n, r) => `Aktionszeile ${n}: Der Bot kann die Rolle „${r}“ nicht vergeben (über der Bot-Rolle oder von Integration verwaltet).`, minmax: (n) => `Aktionszeile ${n}: „Mindestens“ und „Höchstens“ passen nicht zur Zahl der Optionen.`, name: 'Die Vorlage braucht einen Namen.',
      },
      tooLarge: 'Die Vorlagen sind insgesamt zu groß. Lösche Vorlagen oder kürze Texte.', saveErr: 'Speichern fehlgeschlagen. Bitte versuche es erneut.',
      noDb: 'Der Datenspeicher ist nicht eingerichtet oder nicht erreichbar.', badJson: 'Die Datei guild_data.json ist fehlerhaft und muss zuerst repariert werden.',
      loadErr: 'Die Einstellungen konnten nicht geladen werden.', apiMissing: 'Die Schnittstelle wurde nicht gefunden – diese Datei fehlt im Ordner api/ auf GitHub:', delErr: 'Löschen fehlgeschlagen.',
    },
    en: {
      title: 'Custom Messages', back: 'Back to dashboard',
      intro: 'Create custom messages with text, embeds, buttons and select menus and send them to a channel at any time. Click a template to edit it.',
      search: 'Search templates…', create: 'Create new template', empty: 'No templates yet. Create your first one!', noHit: 'No template found.',
      open: 'Open', del: 'Delete', delTitle: 'Delete template', delText: (n) => `Really delete the template “${n}”? Messages already sent with buttons will stop working.`,
      cancel: 'Cancel', add: 'Add', back2: 'Back', discard: 'Discard', yesDelete: 'Delete',
      discardTitle: 'Unsaved changes', discardText: 'If you close now, your changes will be lost.',
      createTitle: 'Create template', createText: 'Enter a name for the template.', nameLabel: 'New template name',
      nameErr: 'Please enter a name (at most 40 characters).', nameTaken: 'This name already exists.', limitErr: `At most ${MAXT} templates are possible.`,
      tabs: { edit: 'Edit', preview: 'Preview', use: 'Use' }, subs: { visual: 'Visual', raw: 'Raw', vars: 'Variables' },
      botName: 'Astryx', botTag: 'BOT',
      defaultText: '**You just created a new template!**\n\n**What now?**\n> - Switch to the “Edit” tab to change the message.\n> - Switch to the “Use” tab to send it to a channel.',
      contentPh: 'Message text – Markdown is supported (**bold**, *italic*, `code`, > quote)',
      addEmbed: 'Embed', addRow: 'Action Row', clear: 'Clear', clearTitle: 'Clear message', clearText: 'Text, embeds and action rows of this template will be removed.', clearYes: 'Clear',
      embed: 'Embed', eAuthor: 'Author', eTitle: 'Title', eDesc: 'Description', eColor: 'Color (hex)', eThumb: 'Thumbnail URL', eImage: 'Image URL', eFooter: 'Footer',
      fields: 'Fields', addField: 'Field', fName: 'Name', fValue: 'Value', fInline: 'Inline',
      row: 'Action Row', addButton: 'Button', addSelect: 'Select menu', btnLabel: 'Label', btnStyle: 'Color', btnDefault: 'Button', optDefault: 'Option',
      styles: { primary: 'Blue', secondary: 'Gray', success: 'Green', danger: 'Red' },
      selPh: 'Placeholder text', selMin: 'At least', selMax: 'At most', options: 'Options', addOption: 'Option', optLabel: 'Label', optDesc: 'Description (optional)', menu: 'Select menu',
      actions: 'Actions', addAction: 'Action', noActions: 'Without an action, clicking does nothing.',
      actTypes: { role_add: 'Give role(s)', role_remove: 'Remove role(s)', message: 'Send message' },
      rolePh: 'Add role…', noRole: 'No role found', picked: '✓ selected', reasonManaged: 'managed by an integration', reasonHierarchy: 'above the bot role',
      msgText: 'Message', mEphemeral: 'Only visible to the user', mDm: 'As direct message', remove: 'Remove',
      rawApply: 'Apply', rawOk: 'Applied ✔', rawErr: (m) => `This is not valid JSON or not a valid message: ${m}`, rawObj: 'It must be an object.',
      varsIntro: 'Placeholders in texts. They are replaced where they apply.',
      varsHead: ['Placeholder', 'Meaning', 'Example'],
      vars: [['@user', 'Mention of the user', '@Astryx Bot'], ['<user_name>', 'Display name', 'Astryx Bot'], ['<user_username>', 'Username (with #tag, if any)', 'Astryx Bot#3513'], ['<user_id>', 'Discord ID', '1555467302282207272'], ['{server}', 'Name of the server', 'Magdeburg RP'], ['{members}', 'Number of members', '128']],
      varsWhere: 'The user placeholders (@user, <user_name>, <user_username>, <user_id>) apply in messages triggered by a button or a menu, and in the Welcomer. {server} and {members} also apply in the sent message itself.',
      previewEmpty: 'The message is empty.', menuPh: 'Select an option…',
      useTabs: { send: 'Send', edit: 'Edit', schedule: 'Schedule', automate: 'Automate', sticky: 'Sticky' }, soon: 'Coming soon',
      autoIntro: 'Send this template automatically again and again – at the interval you choose.',
      interval: 'Interval', custom: 'Custom', customHours: 'hours', customDays: 'days',
      intervalErr: 'The interval must be between 1 hour and 30 days.',
      autoNote: 'The first message is sent after the interval has passed, then always at the same interval. The bot has to be online for this.',
      autoBtn: 'Start automation', autoStarting: 'Starting …', autoStarted: (w) => `Automation started ✔ – first message: ${w}`,
      autoActive: 'Active automations', autoNone: 'No automation is running for this template yet.', autoCount: (n) => `${n} / ${MAXA} on this server`,
      every: (m) => (m % 1440 === 0 ? (m === 1440 ? 'every day' : `every ${m / 1440} days`) : m % 60 === 0 ? (m === 60 ? 'every hour' : `every ${m / 60} hours`) : `every ${m} minutes`),
      next: (w) => `Next message: ${w}`, stop: 'Stop', webhookTarget: (id) => `Webhook ${id}`,
      stopTitle: 'Stop automation', stopText: 'This message will no longer be sent automatically.', stopYes: 'Stop',
      editIntro: 'Edit a message the bot has already sent, using this template.',
      linkLabel: 'Message link', linkPh: 'https://discord.com/channels/…', linkHelp: 'How to get it: right-click the message → “Copy Message Link”.',
      editWarn: 'This does not work for messages that were sent via a webhook. The bot can only edit messages it sent itself.',
      editBtn: 'Edit message', editing: 'Editing …', edited: 'Edited ✔',
      linkInvalid: 'This is not a valid message link.', linkOtherServer: 'This link belongs to a different server.',
      useIntro: 'Send this template into a channel.', channel: 'Channel', channelPh: 'Enter channel name', noChannel: 'No channel found',
      webhook: 'Webhook', webhookPh: 'https://discord.com/api/webhooks/…', webhookHint: 'Sent via webhook: without buttons and menus, but with “Powered by Astryx”.',
      sendBtn: 'Send message', saveFirst: 'Save your changes before sending.', sending: 'Sending …', sent: 'Sent ✔', openMsg: 'Open message',
      sErr: { interval_invalid: 'The interval must be between 1 hour and 30 days.', too_many_autos: 'This server already has 10 automations running – stop one to start a new one.', no_permission: 'The bot may not write or read in this channel (check “View Channel”, “Read Message History”, “Send Messages” and “Embed Links”).', link_invalid: 'This is not a valid message link.', link_wrong_server: 'This link belongs to a different server.', message_unknown: 'This message was not found (deleted, or the bot cannot see the channel).', webhook_message: 'This message was sent via a webhook. The bot cannot edit webhook messages.', not_bot_message: 'This message was not sent by the bot. The bot can only edit its own messages.', channel_unknown: 'This channel does not exist (anymore).', webhook_invalid: 'This is not a valid Discord webhook URL.', webhook_unknown: 'This webhook does not exist (anymore) or the URL is wrong.', empty_message: 'The message is empty – add text or an embed with content.', rate_limited: 'Discord is rate limiting right now. Please wait a moment and try again.', too_long: 'The text is too long together with the “Powered by Astryx” line (at most 2000 characters).', template_missing: 'The template is not saved.' },
      unsaved: 'Careful — you have unsaved changes!', reset: 'Reset', save: 'Save', saving2: 'Saving …', saved: 'Saved ✔',
      c: {
        content: `The text is too long (at most ${LIM.content} characters).`, embeds: `At most ${LIM.embeds} embeds.`, total: `All embeds together may have at most ${LIM.embedTotal} characters.`,
        color: (n) => `Embed ${n}: invalid color (example: #2ECC71).`, url: (n) => `Embed ${n}: URLs must start with https://.`, field: (n) => `Embed ${n}: fields need a name and a value.`,
        rowEmpty: (n) => `Action row ${n} is empty – add a button or a menu, or delete it.`, label: (n) => `Action row ${n}: every button and option needs a label.`,
        action: (n, x) => `Action row ${n}: “${x}” needs at least one action.`, roles: (n, x) => `Action row ${n}: “${x}” – select at least one role.`, text: (n, x) => `Action row ${n}: “${x}” – the message must not be empty.`,
        badRole: (n, r) => `Action row ${n}: The bot cannot assign the role “${r}” (above the bot role or managed by an integration).`, minmax: (n) => `Action row ${n}: “At least” and “At most” do not match the number of options.`, name: 'The template needs a name.',
      },
      tooLarge: 'The templates are too large in total. Delete templates or shorten texts.', saveErr: 'Saving failed. Please try again.',
      noDb: 'The data storage is not set up or not reachable.', badJson: 'The file guild_data.json is broken and has to be fixed first.',
      loadErr: 'The settings could not be loaded.', apiMissing: 'The endpoint was not found – this file is missing from the api/ folder on GitHub:', delErr: 'Deleting failed.',
    },
  }[lang];

  if (!P) { $('#msg').textContent = 'Die Datei placeholders.js fehlt im Ordner public/ (oder ist in messages.html nicht eingebunden).'; return; }
  const ME = window.ME || fetch('/api/me').then(r => (r.ok ? r.json() : null)).then(d => (d && d.user) || null).catch(() => null);

  // IDs: /USER_ID/GUILD_ID/messages oder /messages?uid=USER_ID&gid=GUILD_ID
  const parts = location.pathname.split('/').filter(Boolean);
  const qs = new URLSearchParams(location.search);
  const [uid, gid] = parts.length >= 3 ? parts : [qs.get('uid'), qs.get('gid')];
  const validIds = /^\d+$/.test(uid || '') && /^\d+$/.test(gid || '');
  $('#title').append(L.title);
  const msg = $('#msg');
  const app = $('#app');

  const sk = (w) => el('div', { className: 'sk-line', style: `width:${w}` });
  app.replaceChildren(...[0, 1, 2].map(() => el('section', { className: 'cfg-card' }, sk('35%'), el('div', { style: 'height:14px' }), sk('90%'))));
  const q = `uid=${uid}&gid=${gid}`;
  const dataP = validIds ? fetch(`/api/messages?${q}`, { cache: 'no-store' }).catch(() => null) : null;

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
  if (!wr || !wr.ok) { app.replaceChildren(); return fail(wr, 'messages'); }
  const data = await wr.json();
  app.replaceChildren();
  const guild = data.guild, channels = data.channels, roles = data.roles;
  let autos = Array.isArray(data.automations) ? data.automations : [];
  const byRole = Object.fromEntries(roles.map(r => [r.id, r]));
  const post = (body) => fetch(`/api/messages?${q}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  // ---------- Daten bereinigen (gespeicherte Vorlagen, Raw-Import) ----------
  const newId = () => {
    const b = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(4)) : Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return Array.from(b, x => x.toString(36).padStart(2, '0')).join('').slice(0, 8);
  };
  const asStr = (v) => (typeof v === 'string' ? v : '');
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const normAction = (a) => {
    a = isObj(a) ? a : {};
    if (a.type === 'message') return { type: 'message', text: asStr(a.text), mode: a.mode === 'dm' ? 'dm' : 'ephemeral' };
    return { type: a.type === 'role_remove' ? 'role_remove' : 'role_add', roles: (Array.isArray(a.roles) ? a.roles : []).filter(x => typeof x === 'string') };
  };
  const normItem = (i, kind) => {
    i = isObj(i) ? i : {};
    const base = { id: ID.test(asStr(i.id)) ? i.id : newId(), label: asStr(i.label), actions: (Array.isArray(i.actions) ? i.actions : []).slice(0, LIM.actions).map(normAction) };
    return kind === 'buttons' ? { ...base, style: STYLES.includes(i.style) ? i.style : 'primary' } : { ...base, description: asStr(i.description) };
  };
  const normRow = (r) => {
    r = isObj(r) ? r : {};
    const type = r.type === 'select' ? 'select' : 'buttons';
    const items = (Array.isArray(r.items) ? r.items : []).slice(0, type === 'buttons' ? LIM.buttons : LIM.options).map(i => normItem(i, type));
    const row = { id: ID.test(asStr(r.id)) ? r.id : newId(), type, items };
    if (type === 'select') {
      const num = (v, d) => (Number.isInteger(Number(v)) && v !== '' && v !== null && v !== undefined ? Number(v) : d);
      Object.assign(row, { placeholder: asStr(r.placeholder), minValues: num(r.minValues, 1), maxValues: num(r.maxValues, 1) });
    }
    return row;
  };
  const normEmbed = (e) => {
    e = isObj(e) ? e : {};
    return { color: asStr(e.color), author: asStr(e.author), title: asStr(e.title), description: asStr(e.description), thumbnail: asStr(e.thumbnail), image: asStr(e.image), footer: asStr(e.footer),
      fields: (Array.isArray(e.fields) ? e.fields : []).slice(0, LIM.fields).filter(isObj).map(f => ({ name: asStr(f.name), value: asStr(f.value), inline: f.inline === true })) };
  };
  const dedupeIds = (components) => {
    const used = new Set();
    const fix = (o) => { if (used.has(o.id)) o.id = newId(); used.add(o.id); };
    components.forEach(r => { fix(r); r.items.forEach(fix); });
  };
  const lnorm = (o) => {
    o = isObj(o) ? o : {};
    const d = { content: asStr(o.content), embeds: (Array.isArray(o.embeds) ? o.embeds : []).slice(0, LIM.embeds).map(normEmbed), components: (Array.isArray(o.components) ? o.components : []).slice(0, LIM.rows).map(normRow) };
    dedupeIds(d.components);
    return d;
  };
  const lnormTemplate = (o) => ({ id: ID.test(asStr(o.id)) ? o.id : newId(), name: asStr(o.name), ...lnorm(o) });

  // ---------- Prüfen (gleiche Regeln wie der Server) ----------
  const check = (d) => {
    if (!d.name.trim() || d.name.trim().length > 40) return L.c.name;
    if (d.content.length > LIM.content) return L.c.content;
    if (d.embeds.length > LIM.embeds) return L.c.embeds;
    let total = 0;
    for (let i = 0; i < d.embeds.length; i++) {
      const e = d.embeds[i], n = i + 1;
      if (e.color && !HEX.test(e.color)) return L.c.color(n);
      for (const u of [e.thumbnail, e.image]) if (u.trim() && !/^https?:\/\/\S+$/i.test(u.trim())) return L.c.url(n);
      for (const f of e.fields) if (!f.name || !f.value) return L.c.field(n);
      total += e.author.length + e.title.length + e.description.length + e.footer.length + e.fields.reduce((s, f) => s + f.name.length + f.value.length, 0);
    }
    if (total > LIM.embedTotal) return L.c.total;
    for (let i = 0; i < d.components.length; i++) {
      const r = d.components[i], n = i + 1;
      if (!r.items.length) return L.c.rowEmpty(n);
      if (r.type === 'select' && !(r.minValues >= 1 && r.maxValues >= r.minValues && r.maxValues <= r.items.length)) return L.c.minmax(n);
      for (const it of r.items) {
        if (!it.label.trim()) return L.c.label(n);
        if (!it.actions.length) return L.c.action(n, it.label);
        for (const a of it.actions) {
          if (a.type === 'message') { if (!a.text.trim()) return L.c.text(n, it.label); }
          else {
            if (!a.roles.length) return L.c.roles(n, it.label);
            for (const id of a.roles) if (!byRole[id] || !byRole[id].assignable) return L.c.badRole(n, byRole[id] ? byRole[id].name : id);
          }
        }
      }
    }
    return null;
  };

  // ---------- Vorschau (Markdown wie bei Discord, ohne HTML zu erlauben) ----------
  const ctx = () => ({ server: guild.name, members: 128 });
  const inline = (text, parent) => {
    const re = /\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|~~([^~\n]+)~~|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)|(\uE000)/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.append(text.slice(last, m.index));
      const wrap = (tag, s) => { const n = el(tag); inline(s, n); parent.append(n); };
      if (m[1] !== undefined) wrap('strong', m[1]);
      else if (m[2] !== undefined) wrap('u', m[2]);
      else if (m[3] !== undefined) wrap('em', m[3]);
      else if (m[4] !== undefined) wrap('s', m[4]);
      else if (m[5] !== undefined) parent.append(el('code', { textContent: m[5] }));
      else if (m[6] !== undefined) parent.append(el('a', { href: m[7], textContent: m[6], target: '_blank', rel: 'noopener noreferrer' }));
      else parent.append(el('span', { className: 'mention', textContent: '@' + P.sample.name }));
      last = re.lastIndex;
    }
    if (last < text.length) parent.append(text.slice(last));
  };
  const md = (raw) => {
    const lines = P.replace(raw, ctx()).split('\n');
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < lines.length) {
      const ln = lines[i];
      if (ln.startsWith('```')) {
        const buf = []; i++;
        while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
        i++;
        frag.append(el('pre', { className: 'codeblock', textContent: buf.join('\n') }));
      } else if (/^> /.test(ln)) {
        const buf = [];
        while (i < lines.length && /^> /.test(lines[i])) buf.push(lines[i++].slice(2));
        const qd = el('div', { className: 'quote' });
        buf.forEach((b, k) => { if (k) qd.append(el('br')); inline(b, qd); });
        frag.append(qd);
      } else {
        const hm = /^(#{1,3}) (.+)$/.exec(ln);
        const sub = /^-# (.+)$/.exec(ln);
        const d = el('div', { className: hm ? 'h' + hm[1].length : sub ? 'subtext' : 'line' });
        if (ln === '') d.append(el('br')); else inline(hm ? hm[2] : sub ? sub[1] : ln, d);
        frag.append(d);
        i++;
      }
    }
    return frag;
  };
  const renderEmbed = (e) => {
    const box = el('div', { className: 'pv-embed' });
    box.style.borderLeftColor = HEX.test(e.color) ? e.color : '#4f545c';
    if (e.author) box.append(el('div', { className: 'pv-eauthor' }, md(e.author)));
    if (e.title) box.append(el('div', { className: 'pv-etitle' }, md(e.title)));
    if (e.description) box.append(el('div', { className: 'pv-edesc' }, md(e.description)));
    if (e.fields.length) {
      const g = el('div', { className: 'pv-fields' });
      e.fields.forEach(f => g.append(el('div', { className: 'pv-field' + (f.inline ? ' inl' : '') }, el('div', { className: 'pv-fname' }, md(f.name)), el('div', { className: 'pv-fval' }, md(f.value)))));
      box.append(g);
    }
    const img = (u, cls) => (/^https?:\/\/\S+$/i.test(u.trim()) ? el('img', { className: cls, src: u.trim(), alt: '', referrerPolicy: 'no-referrer' }) : null);
    const th = img(e.thumbnail, 'pv-thumb'); if (th) box.append(th);
    const im = img(e.image, 'pv-img'); if (im) box.append(im);
    if (e.footer) box.append(el('div', { className: 'pv-efoot' }, md(e.footer)));
    return box;
  };
  const renderMessage = (d) => {
    const box = el('div', { className: 'pv' });
    box.append(el('div', { className: 'pv-head' }, el('span', { className: 'pv-av', textContent: 'A' }), el('span', { className: 'pv-bot', textContent: L.botName }), el('span', { className: 'pv-app', textContent: L.botTag })));
    if (!d.content.trim() && !d.embeds.length && !d.components.length) { box.append(el('div', { className: 'hint', textContent: L.previewEmpty })); return box; }
    if (d.content.trim()) box.append(el('div', { className: 'pv-text' }, md(d.content)));
    d.embeds.forEach(e => box.append(renderEmbed(e)));
    d.components.forEach(r => {
      const row = el('div', { className: 'pv-row' });
      if (r.type === 'buttons') r.items.forEach(b => row.append(el('span', { className: 'pv-btn ' + b.style, textContent: b.label || '…' })));
      else row.append(el('span', { className: 'pv-select' }, el('span', { textContent: r.placeholder || L.menuPh }), el('span', { textContent: '⌄' })));
      box.append(row);
    });
    return box;
  };

  // ---------- Hilfen ----------
  const dot = (r) => { const d = el('span', { className: 'role-dot' }); d.style.background = r && r.color ? '#' + r.color.toString(16).padStart(6, '0') : '#99aab5'; return d; };
  const reasonText = (r) => (r.reason === 'managed' ? L.reasonManaged : L.reasonHierarchy);
  const iconBtn = (label, title, fn, disabled) => { const b = el('button', { type: 'button', className: 'ib', textContent: label, title, disabled: !!disabled }); b.addEventListener('click', fn); return b; };
  const addBtn = (label, fn, disabled) => { const b = el('button', { type: 'button', className: 'btn small', textContent: '+ ' + label, disabled: !!disabled }); b.addEventListener('click', fn); return b; };
  const lab = (text, input) => el('div', { className: 'field' }, el('label', { textContent: text }), input);

  // Eigene Dialoge (statt der Browser-Fenster)
  const dialog = ({ title, text, input, confirm, cancel, danger }) => new Promise((resolve) => {
    const ov = el('div', { className: 'ov dlg-ov' });
    const box = el('div', { className: 'dlg' });
    const err = el('div', { className: 'dlg-err' });
    let inp = null;
    box.append(el('h3', { textContent: title }));
    if (text) box.append(el('p', { className: 'hint', textContent: text }));
    if (input) {
      inp = el('input', { className: 'input', type: 'text', placeholder: input.placeholder, maxLength: input.max, autocomplete: 'off' });
      box.append(el('label', { className: 'dlg-label', textContent: input.label }), inp, err);
    }
    const close = (v) => { document.removeEventListener('keydown', onKey); ov.remove(); resolve(v); };
    const ok = () => {
      if (!input) return close(true);
      const v = inp.value.trim() || input.placeholder || '';
      const e = input.validate(v);
      if (e) { err.textContent = e; return; }
      close(v);
    };
    const cancelBtn = el('button', { className: 'btn ghost', type: 'button', textContent: cancel });
    const okBtn = el('button', { className: 'btn' + (danger ? ' danger' : ''), type: 'button', textContent: confirm });
    cancelBtn.addEventListener('click', () => close(null));
    okBtn.addEventListener('click', ok);
    box.append(el('div', { className: 'dlg-actions' }, cancelBtn, okBtn));
    ov.append(box);
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(null); });
    const onKey = (e) => { if (e.key === 'Escape') close(null); else if (e.key === 'Enter' && input) ok(); };
    document.addEventListener('keydown', onKey);
    document.body.append(ov);
    if (inp) inp.focus(); else okBtn.focus();
  });

  // ---------- Speichern-Leiste (gehört dem gerade offenen Editor) ----------
  let ed = null;
  const bar = $('#savebar');
  const barMsg = el('span', { className: 'bar-msg' });
  const resetBtn = el('button', { className: 'btn ghost', type: 'button', textContent: L.reset });
  const saveBtn = el('button', { className: 'btn', type: 'button', textContent: L.save });
  bar.append(barMsg, resetBtn, saveBtn);
  const updateBar = () => {
    if (!ed) { bar.classList.remove('show'); return; }
    bar.classList.toggle('show', ed.dirty() || !!ed.note);
    bar.classList.toggle('only-msg', !!ed.note && ed.note.kind === 'ok');
    barMsg.className = 'bar-msg' + (ed.note ? ' ' + ed.note.kind : '');
    barMsg.textContent = ed.note ? ed.note.text : L.unsaved;
  };
  resetBtn.addEventListener('click', () => ed && ed.reset());
  saveBtn.addEventListener('click', () => ed && ed.save());

  // ---------- Liste ----------
  let templates = data.templates.map(lnormTemplate);
  const upsert = (tp) => { const i = templates.findIndex(x => x.id === tp.id); if (i === -1) templates.push(tp); else templates[i] = tp; };
  const nextName = () => { let n = templates.length + 1; const base = lang === 'de' ? 'vorlage' : 'template'; while (templates.some(x => x.name.toLowerCase() === `${base}-${n}`)) n++; return `${base}-${n}`; };
  const defaultTemplate = (name) => ({ id: newId(), name, content: L.defaultText, embeds: [], components: [] });

  const counter = el('span', { className: 'tpl-count' });
  const search = el('input', { className: 'input', type: 'search', placeholder: L.search, autocomplete: 'off' });
  const createBtn = el('button', { className: 'btn', type: 'button', textContent: L.create });
  const listEl = el('div', { className: 'tpl-list' });
  app.append(el('div', { className: 'intro' }, el('p', { textContent: L.intro }), counter), el('div', { className: 'toolbar' }, search, createBtn), listEl);

  const removeTpl = async (tp) => {
    const yes = await dialog({ title: L.delTitle, text: L.delText(tp.name), confirm: L.yesDelete, cancel: L.cancel, danger: true });
    if (!yes) return;
    msg.textContent = '';
    try {
      const r = await post({ op: 'delete', id: tp.id });
      if (!r.ok) throw new Error();
      templates = templates.filter(x => x.id !== tp.id);
      renderList();
    } catch { msg.textContent = L.delErr; }
  };
  const renderList = () => {
    counter.textContent = `${templates.length} / ${MAXT}`;
    listEl.replaceChildren();
    const ql = search.value.trim().toLowerCase();
    const items = templates.filter(x => x.name.toLowerCase().includes(ql)).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) { listEl.append(el('div', { className: 'hint', textContent: templates.length ? L.noHit : L.empty })); return; }
    items.forEach((tp) => {
      const row = el('div', { className: 'tpl-row' }, el('span', { className: 'tpl-name', textContent: tp.name }),
        iconBtn('✎', L.open, () => openEditor(clone(tp), false)), iconBtn('✕', L.del, () => removeTpl(tp)));
      row.querySelector('.tpl-name').addEventListener('click', () => openEditor(clone(tp), false));
      listEl.append(row);
    });
  };
  search.addEventListener('input', renderList);
  createBtn.addEventListener('click', async () => {
    if (templates.length >= MAXT) { msg.textContent = L.limitErr; return; }
    msg.textContent = '';
    const name = await dialog({
      title: L.createTitle, text: L.createText, confirm: L.add, cancel: L.cancel,
      input: { label: L.nameLabel, placeholder: nextName(), max: 40,
        validate: (v) => (!v || v.length > 40 ? L.nameErr : templates.some(x => x.name.toLowerCase() === v.toLowerCase()) ? L.nameTaken : null) },
    });
    if (name) openEditor(defaultTemplate(name), true);
  });

  // ---------- Editor (Fenster mit Bearbeiten / Vorschau / Verwenden) ----------
  function openEditor(tpl, isNew) {
    const S = { draft: clone(tpl), initial: clone(tpl), original: isNew ? null : canon(tpl), isNew, tab: 'preview', sub: 'visual', note: null, use: 'send', ch: '', hook: false, url: '', res: null, link: '', eres: null, interval: 1440, customOn: false, customN: '', customUnit: 'h', ares: null, busy: false };
    S.dirty = () => S.isNew || canon(S.draft) !== S.original;
    const ov = el('div', { className: 'ov' });
    const modal = el('div', { className: 'modal' });
    const tabsEl = el('div', { className: 'tabs' });
    const body = el('div', { className: 'mbody' });
    modal.append(tabsEl, body);
    ov.append(modal);
    const touch = () => { if (S.note && S.note.kind === 'err') S.note = null; updateBar(); };
    const rerender = () => { const st = ov.scrollTop; renderBody(); ov.scrollTop = st; };
    const bindText = (input, o, key, max) => { input.value = o[key]; if (max) input.maxLength = max; input.addEventListener('input', () => { o[key] = input.value; touch(); }); return input; };

    // ----- Aktionen (Rollen vergeben/entfernen, Nachricht senden) -----
    const rolePicker = (a) => {
      const chips = el('div', { className: 'chips' });
      a.roles.forEach((id, i) => {
        const r = byRole[id];
        chips.append(el('span', { className: 'chip' + (r && r.assignable ? '' : ' bad') }, r ? dot(r) : null, r ? r.name : `? ${id}`, iconBtn('✕', L.remove, () => { a.roles.splice(i, 1); rerender(); })));
      });
      const input = el('input', { className: 'input', type: 'text', placeholder: L.rolePh, autocomplete: 'off' });
      const list = el('div', { className: 'combo-list' });
      list.hidden = true;
      const renderRoles = (query = '') => {
        list.replaceChildren();
        const ql = query.toLowerCase();
        const found = roles.filter(r => r.name.toLowerCase().includes(ql));
        if (!found.length) { list.append(el('div', { className: 'combo-empty', textContent: L.noRole })); return; }
        found.forEach((r) => {
          const taken = a.roles.includes(r.id), dis = !r.assignable || taken;
          const note = !r.assignable ? reasonText(r) : taken ? L.picked : '';
          const o = el('div', { className: 'combo-opt' + (dis ? ' dis' : '') }, el('span', { className: 'nm' }, dot(r), r.name), note ? el('small', { textContent: note }) : null);
          o.addEventListener('mousedown', (e) => { e.preventDefault(); if (dis || a.roles.length >= LIM.roles) return; a.roles.push(r.id); list.hidden = true; rerender(); });
          list.append(o);
        });
      };
      input.addEventListener('focus', () => { renderRoles(); list.hidden = false; });
      input.addEventListener('input', () => { renderRoles(input.value.trim()); list.hidden = false; });
      input.addEventListener('blur', () => { list.hidden = true; });
      return el('div', { className: 'rp' }, chips, el('div', { className: 'combo' }, input, list));
    };
    const switchAction = (a, type) => {
      if (type === 'message') { delete a.roles; a.text = a.text || ''; a.mode = a.mode || 'ephemeral'; }
      else { a.roles = Array.isArray(a.roles) ? a.roles : []; delete a.text; delete a.mode; }
      a.type = type;
    };
    const actionsEditor = (item) => {
      const wrap = el('div', { className: 'actions' }, el('div', { className: 'sub-label', textContent: L.actions }));
      if (!item.actions.length) wrap.append(el('div', { className: 'hint', textContent: L.noActions }));
      item.actions.forEach((a, ai) => {
        const card = el('div', { className: 'acard' });
        const sel = el('select', { className: 'input' }, ...['role_add', 'role_remove', 'message'].map(k => el('option', { value: k, textContent: L.actTypes[k], selected: a.type === k })));
        sel.addEventListener('change', () => { switchAction(a, sel.value); rerender(); });
        card.append(el('div', { className: 'ahead' }, sel, iconBtn('✕', L.remove, () => { item.actions.splice(ai, 1); rerender(); })));
        if (a.type === 'message') {
          const ta = el('textarea', { className: 'input', rows: 3, placeholder: L.msgText });
          bindText(ta, a, 'text', 2000);
          const name = 'mode_' + newId();
          const radio = (val, label) => {
            const inp = el('input', { type: 'radio', name, checked: a.mode === val });
            inp.addEventListener('change', () => { a.mode = val; touch(); });
            return el('label', { className: 'radio' }, inp, ' ', label);
          };
          card.append(ta, el('div', { className: 'radios' }, radio('ephemeral', L.mEphemeral), radio('dm', L.mDm)));
        } else card.append(rolePicker(a));
        wrap.append(card);
      });
      if (item.actions.length < LIM.actions) wrap.append(addBtn(L.addAction, () => { item.actions.push(normAction({})); rerender(); }));
      return wrap;
    };

    // ----- Buttons, Menüs, Aktionszeilen -----
    const buttonCard = (row, b, bi) => {
      const label = el('input', { className: 'input', type: 'text', placeholder: L.btnLabel });
      bindText(label, b, 'label', 80);
      const style = el('select', { className: 'input' }, ...STYLES.map(s => el('option', { value: s, textContent: L.styles[s], selected: b.style === s })));
      style.addEventListener('change', () => { b.style = style.value; touch(); });
      return el('div', { className: 'icard' },
        el('div', { className: 'ihead' }, el('b', { textContent: `${L.addButton} ${bi + 1}` }), iconBtn('✕', L.remove, () => { row.items.splice(bi, 1); rerender(); })),
        el('div', { className: 'two' }, lab(L.btnLabel, label), lab(L.btnStyle, style)), actionsEditor(b));
    };
    const toButtons = (row) => { row.type = 'buttons'; delete row.placeholder; delete row.minValues; delete row.maxValues; };
    const selectCard = (row) => {
      const ph = el('input', { className: 'input', type: 'text', placeholder: L.selPh });
      bindText(ph, row, 'placeholder', 150);
      const num = (key) => { const i = el('input', { className: 'input', type: 'number', min: 1, max: LIM.options, step: 1 }); i.value = row[key]; i.addEventListener('input', () => { row[key] = parseInt(i.value, 10) || 0; touch(); }); return i; };
      const wrap = el('div', { className: 'icard' }, el('div', { className: 'ihead' }, el('b', { textContent: L.menu })), lab(L.selPh, ph),
        el('div', { className: 'two' }, lab(L.selMin, num('minValues')), lab(L.selMax, num('maxValues'))), el('div', { className: 'sub-label', textContent: L.options }));
      row.items.forEach((o, oi) => {
        const label = el('input', { className: 'input', type: 'text', placeholder: L.optLabel });
        bindText(label, o, 'label', 100);
        const desc = el('input', { className: 'input', type: 'text', placeholder: L.optDesc });
        bindText(desc, o, 'description', 100);
        wrap.append(el('div', { className: 'ocard' },
          el('div', { className: 'ihead' }, el('b', { textContent: `${L.addOption} ${oi + 1}` }), iconBtn('✕', L.remove, () => {
            row.items.splice(oi, 1);
            if (!row.items.length) toButtons(row);
            else { row.maxValues = Math.min(row.maxValues, row.items.length); row.minValues = Math.min(row.minValues, row.maxValues); }
            rerender();
          })),
          el('div', { className: 'two' }, lab(L.optLabel, label), lab(L.optDesc, desc)), actionsEditor(o)));
      });
      if (row.items.length < LIM.options) wrap.append(addBtn(L.addOption, () => { row.items.push(normItem({ label: L.optDefault, actions: [normAction({})] }, 'select')); rerender(); }));
      return wrap;
    };
    const rowCard = (row, ri) => {
      const card = el('div', { className: 'rcard' }, el('div', { className: 'rhead' }, el('b', { textContent: `${L.row} ${ri + 1}` }),
        iconBtn('✕', L.remove, () => { S.draft.components.splice(ri, 1); rerender(); })));
      if (row.type === 'buttons') {
        row.items.forEach((b, bi) => card.append(buttonCard(row, b, bi)));
        const tools = el('div', { className: 'tools' });
        if (row.items.length < LIM.buttons) tools.append(addBtn(L.addButton, () => { row.items.push(normItem({ label: L.btnDefault, actions: [normAction({})] }, 'buttons')); rerender(); }));
        if (!row.items.length) tools.append(addBtn(L.addSelect, () => { Object.assign(row, { type: 'select', placeholder: '', minValues: 1, maxValues: 1, items: [normItem({ label: L.optDefault, actions: [normAction({})] }, 'select')] }); rerender(); }));
        card.append(tools);
      } else card.append(selectCard(row));
      return card;
    };

    // ----- Embeds -----
    const embedCard = (e, i) => {
      const card = el('div', { className: 'ecard' });
      const paint = () => { card.style.borderLeftColor = HEX.test(e.color) ? e.color : '#4f545c'; };
      paint();
      const txt = (key, label, max, area) => lab(label, bindText(el(area ? 'textarea' : 'input', area ? { className: 'input', rows: 4 } : { className: 'input', type: 'text' }), e, key, max));
      const color = el('input', { className: 'input', type: 'text', maxLength: 7, placeholder: '#2ECC71' });
      color.value = e.color;
      const pick = el('input', { className: 'colorpick', type: 'color' });
      if (HEX.test(e.color)) pick.value = e.color.toLowerCase();
      color.addEventListener('input', () => { e.color = color.value.trim(); color.classList.toggle('bad', !!e.color && !HEX.test(e.color)); if (HEX.test(e.color)) pick.value = e.color.toLowerCase(); paint(); touch(); });
      pick.addEventListener('input', () => { e.color = pick.value.toUpperCase(); color.value = e.color; color.classList.remove('bad'); paint(); touch(); });
      card.append(el('div', { className: 'ihead' }, el('b', { textContent: `${L.embed} ${i + 1}` }), iconBtn('✕', L.remove, () => { S.draft.embeds.splice(i, 1); rerender(); })),
        txt('author', L.eAuthor, 256), txt('title', L.eTitle, 256), txt('description', L.eDesc, 4096, true),
        lab(L.eColor, el('div', { className: 'colorrow' }, pick, color)), txt('thumbnail', L.eThumb, 2000), txt('image', L.eImage, 2000), txt('footer', L.eFooter, 2048),
        el('div', { className: 'sub-label', textContent: L.fields }));
      e.fields.forEach((f, fi) => {
        const name = el('input', { className: 'input', type: 'text', placeholder: L.fName });
        bindText(name, f, 'name', 256);
        const value = el('textarea', { className: 'input', rows: 2, placeholder: L.fValue });
        bindText(value, f, 'value', 1024);
        const inl = el('input', { type: 'checkbox', checked: f.inline });
        inl.addEventListener('change', () => { f.inline = inl.checked; touch(); });
        card.append(el('div', { className: 'fcard' }, name, value, el('div', { className: 'fbar' }, el('label', { className: 'radio' }, inl, ' ', L.fInline), iconBtn('✕', L.remove, () => { e.fields.splice(fi, 1); rerender(); }))));
      });
      if (e.fields.length < LIM.fields) card.append(addBtn(L.addField, () => { e.fields.push({ name: '', value: '', inline: false }); rerender(); }));
      return card;
    };

    // ----- Tab "Bearbeiten": Visuell / Raw / Variablen -----
    const renderVisual = (c) => {
      const d = S.draft;
      const ta = el('textarea', { className: 'input', rows: 7, placeholder: L.contentPh });
      bindText(ta, d, 'content', LIM.content);
      const cnt = el('div', { className: 'count' });
      const upd = () => { cnt.textContent = `${d.content.length} / ${LIM.content}`; };
      ta.addEventListener('input', upd); upd();
      const box = el('div', { className: 'msgbox' }, el('div', { className: 'pv-head' }, el('span', { className: 'pv-av', textContent: 'A' }), el('span', { className: 'pv-bot', textContent: L.botName }), el('span', { className: 'pv-app', textContent: L.botTag })), ta, cnt);
      d.embeds.forEach((e, i) => box.append(embedCard(e, i)));
      d.components.forEach((r, i) => box.append(rowCard(r, i)));
      const clear = el('button', { type: 'button', className: 'btn small danger', textContent: L.clear });
      clear.addEventListener('click', async () => {
        if (await dialog({ title: L.clearTitle, text: L.clearText, confirm: L.clearYes, cancel: L.cancel, danger: true })) { d.content = ''; d.embeds = []; d.components = []; touch(); rerender(); }
      });
      c.append(box, el('div', { className: 'tools' }, addBtn(L.addEmbed, () => { d.embeds.push(normEmbed({ color: '#2ECC71' })); rerender(); }, d.embeds.length >= LIM.embeds),
        addBtn(L.addRow, () => { d.components.push(normRow({})); rerender(); }, d.components.length >= LIM.rows), clear));
    };
    const renderRaw = (c) => {
      const view = () => ({ content: S.draft.content, embeds: S.draft.embeds, components: S.draft.components });
      const ta = el('textarea', { className: 'input raw', rows: 22, spellcheck: false });
      ta.value = JSON.stringify(view(), null, 2);
      const out = el('div', { className: 'raw-msg' });
      const apply = el('button', { type: 'button', className: 'btn', textContent: L.rawApply });
      apply.addEventListener('click', () => {
        try {
          const o = JSON.parse(ta.value);
          if (!isObj(o)) throw new Error(L.rawObj);
          Object.assign(S.draft, lnorm(o));
          ta.value = JSON.stringify(view(), null, 2);
          out.className = 'raw-msg ok'; out.textContent = L.rawOk;
          touch();
        } catch (e) { out.className = 'raw-msg err'; out.textContent = L.rawErr(e.message); }
      });
      c.append(ta, el('div', { className: 'tools' }, apply, out));
    };
    const renderVars = (c) => {
      c.append(el('p', { className: 'hint', textContent: L.varsIntro }),
        el('table', { className: 'vars' }, el('thead', {}, el('tr', {}, ...L.varsHead.map(h => el('th', { textContent: h })))),
          el('tbody', {}, ...L.vars.map(([a, b, x]) => el('tr', {}, el('td', {}, el('code', { textContent: a })), el('td', { textContent: b }), el('td', { textContent: x }))))),
        el('p', { className: 'hint', textContent: L.varsWhere }));
    };
    const renderEdit = (c) => {
      const seg = el('div', { className: 'seg' }, ...['visual', 'raw', 'vars'].map((k) => {
        const b = el('button', { type: 'button', className: S.sub === k ? 'active' : '', textContent: L.subs[k] });
        b.addEventListener('click', () => { S.sub = k; renderBody(); });
        return b;
      }));
      c.append(seg);
      const inner = el('div', {});
      c.append(inner);
      if (S.sub === 'visual') renderVisual(inner); else if (S.sub === 'raw') renderRaw(inner); else renderVars(inner);
    };

    // ----- Tab "Verwenden": Senden -----
    // Ziel-Auswahl (Kanal ODER Webhook) – im Reiter "Senden" und "Automatisieren" identisch
    const targetControls = (onChange) => {
      const chInput = el('input', { className: 'input', type: 'text', placeholder: L.channelPh, autocomplete: 'off', disabled: S.hook });
      const chList = el('div', { className: 'combo-list' });
      chList.hidden = true;
      const showCh = () => { const x = channels.find(k => k.id === S.ch); chInput.value = x ? `# ${x.name}` : ''; };
      const renderChannels = (query = '') => {
        chList.replaceChildren();
        const ql = query.toLowerCase();
        const found = channels.filter(x => x.name.toLowerCase().includes(ql));
        if (!found.length) { chList.append(el('div', { className: 'combo-empty', textContent: L.noChannel })); return; }
        found.forEach((x) => {
          const o = el('div', { className: 'combo-opt' + (x.id === S.ch ? ' sel' : '') }, el('span', { textContent: `# ${x.name}` }), x.category ? el('small', { textContent: x.category }) : null);
          o.addEventListener('mousedown', (e) => { e.preventDefault(); S.ch = x.id; showCh(); chList.hidden = true; chInput.blur(); onChange(); });
          chList.append(o);
        });
      };
      chInput.addEventListener('focus', () => { chInput.select(); renderChannels(); chList.hidden = false; });
      chInput.addEventListener('input', () => { renderChannels(chInput.value.replace(/^#\s*/, '').trim()); chList.hidden = false; });
      chInput.addEventListener('blur', () => { chList.hidden = true; showCh(); });
      showCh();

      const hookBox = el('input', { type: 'checkbox', checked: S.hook });
      const urlInput = el('input', { className: 'input', type: 'text', placeholder: L.webhookPh, autocomplete: 'off', hidden: !S.hook });
      urlInput.value = S.url;
      const hookHint = el('div', { className: 'hint', textContent: L.webhookHint, hidden: !S.hook });
      hookBox.addEventListener('change', () => { S.hook = hookBox.checked; urlInput.hidden = hookHint.hidden = !S.hook; chInput.disabled = S.hook; onChange(); });
      urlInput.addEventListener('input', () => { S.url = urlInput.value; onChange(); });
      return {
        nodes: [el('div', { className: 'field' }, el('label', { textContent: L.channel }), el('div', { className: 'combo' }, chInput, chList)),
          el('div', { className: 'field' }, el('label', { className: 'radio' }, hookBox, ' ', L.webhook), urlInput), hookHint],
        ready: () => !!(S.hook ? S.url.trim() : S.ch),
      };
    };
    const fail503 = (j) => `${L.noDb}${j.detail ? ' – ' + j.detail : ''}`;

    const renderSendPanel = (c) => {
      c.append(el('p', { className: 'center hint', textContent: L.useIntro }));
      const target = targetControls(() => refresh());
      const saveHint = el('div', { className: 'hint warn', textContent: L.saveFirst });
      const sendBtn = el('button', { type: 'button', className: 'btn', textContent: L.sendBtn });
      const info = el('div', { className: 'sendmsg' });
      const refresh = () => {
        const dirty = S.dirty();
        saveHint.hidden = !dirty;
        sendBtn.disabled = dirty || S.busy || !target.ready();
      };
      const showRes = () => {
        info.replaceChildren();
        if (!S.res) return;
        info.className = 'sendmsg ' + S.res.kind;
        info.append(S.res.text);
        if (S.res.url) info.append(' ', el('a', { href: S.res.url, target: '_blank', rel: 'noopener noreferrer', textContent: L.openMsg }));
      };
      sendBtn.addEventListener('click', async () => {
        S.busy = true; S.res = { text: L.sending, kind: '' }; refresh(); showRes();
        try {
          const r = await post(S.hook ? { op: 'webhook', id: S.draft.id, url: S.url.trim() } : { op: 'send', id: S.draft.id, channelId: S.ch });
          let j = {}; try { j = await r.clone().json(); } catch {}
          if (r.ok) S.res = { text: L.sent, kind: 'ok', url: j.url || null };
          else if (r.status === 401) S.res = { text: t('guilds_expired'), kind: 'err' };
          else if (r.status === 503) S.res = { text: fail503(j), kind: 'err' };
          else S.res = { text: L.sErr[j.error] || `${L.saveErr}${j.detail ? ' – ' + j.detail : ''}`, kind: 'err' };
        } catch { S.res = { text: L.saveErr, kind: 'err' }; }
        S.busy = false; refresh(); showRes();
      });
      c.append(...target.nodes, saveHint, el('div', { className: 'tools' }, sendBtn), info);
      refresh(); showRes();
    };

    // ----- "Automatisieren": wie "Senden", aber der Bot wiederholt es im gewählten Abstand -----
    const INTERVALS = [60, 120, 180, 360, 720, 1440, 2880, 4320, 10080, 20160, 43200];   // 1h … 30 Tage
    const chipLabel = (m) => (m % 1440 === 0 ? `${m / 1440}d` : `${m / 60}h`);
    const intervalOk = () => Number.isInteger(S.interval) && S.interval >= 60 && S.interval <= 43200;
    const whenText = (iso) => (iso ? new Date(iso).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '–');
    const stopAuto = async (x) => {
      if (!(await dialog({ title: L.stopTitle, text: L.stopText, confirm: L.stopYes, cancel: L.cancel, danger: true }))) return;
      try {
        const r = await post({ op: 'auto_delete', autoId: x.id });
        if (!r.ok) throw new Error();
        autos = autos.filter(k => k.id !== x.id); S.ares = null;
      } catch { S.ares = { text: L.delErr, kind: 'err' }; }
      renderBody();
    };
    const renderAutoPanel = (c) => {
      c.append(el('p', { className: 'center hint', textContent: L.autoIntro }));
      const target = targetControls(() => refresh());

      const chips = el('div', { className: 'ichips' });
      const nIn = el('input', { className: 'input', type: 'number', min: 1, step: 1, placeholder: '12' });
      nIn.value = S.customN;
      const uSel = el('select', { className: 'input' }, el('option', { value: 'h', textContent: L.customHours, selected: S.customUnit === 'h' }), el('option', { value: 'd', textContent: L.customDays, selected: S.customUnit === 'd' }));
      const customRow = el('div', { className: 'two icustom' }, nIn, uSel);
      customRow.hidden = !S.customOn;
      const errEl = el('div', { className: 'hint warn' });
      const applyCustom = () => { const n = parseInt(nIn.value, 10); S.customN = nIn.value; S.customUnit = uSel.value; S.interval = Number.isFinite(n) ? n * (S.customUnit === 'd' ? 1440 : 60) : 0; };
      const paint = () => {
        const chip = (label, active, fn) => { const b = el('button', { type: 'button', className: 'chipbtn' + (active ? ' active' : ''), textContent: label }); b.addEventListener('click', fn); return b; };
        chips.replaceChildren(...INTERVALS.map(m => chip(chipLabel(m), !S.customOn && S.interval === m, () => { S.customOn = false; S.interval = m; customRow.hidden = true; paint(); refresh(); })),
          chip(L.custom, S.customOn, () => { S.customOn = true; customRow.hidden = false; applyCustom(); paint(); refresh(); nIn.focus(); }));
      };
      nIn.addEventListener('input', () => { applyCustom(); refresh(); });
      uSel.addEventListener('change', () => { applyCustom(); refresh(); });

      const saveHint = el('div', { className: 'hint warn', textContent: L.saveFirst });
      const startBtn = el('button', { type: 'button', className: 'btn', textContent: L.autoBtn });
      const info = el('div', { className: 'sendmsg' });
      const listEl = el('div', { className: 'alist' });
      const renderAutos = () => {
        listEl.replaceChildren(el('div', { className: 'sub-label', textContent: `${L.autoActive} · ${L.autoCount(autos.length)}` }));
        const mine = autos.filter(x => x.templateId === S.draft.id);
        if (!mine.length) { listEl.append(el('div', { className: 'hint', textContent: L.autoNone })); return; }
        mine.forEach((x) => {
          const ch = channels.find(k => k.id === x.channelId);
          const label = x.kind === 'webhook' ? L.webhookTarget(x.hook || '') : `# ${ch ? ch.name : '?'}`;
          listEl.append(el('div', { className: 'arow' },
            el('div', { className: 'ainfo' }, el('b', { textContent: label }), el('span', { textContent: ` · ${L.every(x.intervalMin)}` }), el('div', { className: 'hint', textContent: L.next(whenText(x.nextAt)) })),
            iconBtn('✕', L.stop, () => stopAuto(x))));
        });
      };
      const showRes = () => {
        info.replaceChildren();
        if (!S.ares) return;
        info.className = 'sendmsg ' + S.ares.kind;
        info.append(S.ares.text);
      };
      const refresh = () => {
        const dirty = S.dirty();
        errEl.textContent = S.customOn && S.customN !== '' && !intervalOk() ? L.intervalErr : '';
        errEl.hidden = !errEl.textContent;
        saveHint.hidden = !dirty;
        startBtn.disabled = dirty || S.busy || !target.ready() || !intervalOk() || autos.length >= MAXA;
      };
      startBtn.addEventListener('click', async () => {
        S.busy = true; S.ares = { text: L.autoStarting, kind: '' }; refresh(); showRes();
        try {
          const r = await post(S.hook
            ? { op: 'auto_add', id: S.draft.id, kind: 'webhook', url: S.url.trim(), intervalMin: S.interval }
            : { op: 'auto_add', id: S.draft.id, kind: 'channel', channelId: S.ch, intervalMin: S.interval });
          let j = {}; try { j = await r.clone().json(); } catch {}
          if (r.ok && j.automation) { autos = [...autos, j.automation]; S.ares = { text: L.autoStarted(whenText(j.automation.nextAt)), kind: 'ok' }; }
          else if (r.status === 401) S.ares = { text: t('guilds_expired'), kind: 'err' };
          else if (r.status === 503) S.ares = { text: fail503(j), kind: 'err' };
          else S.ares = { text: L.sErr[j.error] || `${L.saveErr}${j.detail ? ' – ' + j.detail : ''}`, kind: 'err' };
        } catch { S.ares = { text: L.saveErr, kind: 'err' }; }
        S.busy = false; renderAutos(); refresh(); showRes();
      });

      c.append(...target.nodes,
        el('div', { className: 'field' }, el('label', { textContent: L.interval }), chips, customRow, errEl),
        el('div', { className: 'hint', textContent: L.autoNote }), saveHint, el('div', { className: 'tools' }, startBtn), info, listEl);
      paint(); renderAutos(); refresh(); showRes();
    };

    // ----- "Bearbeiten": bereits gesendete Nachricht per Link ändern -----
    const renderEditPanel = (c) => {
      const link = el('input', { className: 'input', type: 'text', placeholder: L.linkPh, autocomplete: 'off' });
      link.value = S.link;
      const bad = el('div', { className: 'hint warn' });
      const saveHint = el('div', { className: 'hint warn', textContent: L.saveFirst });
      const btn = el('button', { type: 'button', className: 'btn', textContent: L.editBtn });
      const info = el('div', { className: 'sendmsg' });
      const refresh = () => {
        const m = LINK.exec(S.link.trim());
        const other = !!m && m[1] !== gid;
        bad.textContent = S.link.trim() && !m ? L.linkInvalid : other ? L.linkOtherServer : '';
        bad.hidden = !bad.textContent;
        saveHint.hidden = !S.dirty();
        btn.disabled = S.dirty() || S.busy || !m || other;
      };
      const showRes = () => {
        info.replaceChildren();
        if (!S.eres) return;
        info.className = 'sendmsg ' + S.eres.kind;
        info.append(S.eres.text);
        if (S.eres.url) info.append(' ', el('a', { href: S.eres.url, target: '_blank', rel: 'noopener noreferrer', textContent: L.openMsg }));
      };
      link.addEventListener('input', () => { S.link = link.value; refresh(); });
      btn.addEventListener('click', async () => {
        S.busy = true; S.eres = { text: L.editing, kind: '' }; refresh(); showRes();
        try {
          const r = await post({ op: 'edit', id: S.draft.id, link: S.link.trim() });
          let j = {}; try { j = await r.clone().json(); } catch {}
          if (r.ok) S.eres = { text: L.edited, kind: 'ok', url: j.url || null };
          else if (r.status === 401) S.eres = { text: t('guilds_expired'), kind: 'err' };
          else if (r.status === 503) S.eres = { text: `${L.noDb}${j.detail ? ' – ' + j.detail : ''}`, kind: 'err' };
          else S.eres = { text: L.sErr[j.error] || `${L.saveErr}${j.detail ? ' – ' + j.detail : ''}`, kind: 'err' };
        } catch { S.eres = { text: L.saveErr, kind: 'err' }; }
        S.busy = false; refresh(); showRes();
      });
      c.append(el('p', { className: 'center hint', textContent: L.editIntro }),
        el('div', { className: 'warnbox' }, el('b', { textContent: '⚠ ' }), L.editWarn),
        el('div', { className: 'field' }, el('label', { textContent: L.linkLabel }), link), el('div', { className: 'hint', textContent: L.linkHelp }),
        bad, saveHint, el('div', { className: 'tools' }, btn), info);
      refresh(); showRes();
    };
    const renderUse = (c) => {
      const live = ['send', 'edit', 'automate'];
      c.append(el('div', { className: 'seg' }, ...['send', 'edit', 'schedule', 'automate', 'sticky'].map((k) => {
        const on = live.includes(k);
        const b = el('button', { type: 'button', className: S.use === k ? 'active' : on ? '' : 'dis', disabled: !on, title: on ? '' : L.soon }, L.useTabs[k], (k === 'edit' || k === 'automate') && F ? F.tag('new', true) : null);
        if (on) b.addEventListener('click', () => { S.use = k; renderBody(); });
        return b;
      })));
      if (S.use === 'edit') renderEditPanel(c); else if (S.use === 'automate') renderAutoPanel(c); else renderSendPanel(c);
    };

    // ----- Fenster-Aufbau -----
    const renderBody = () => {
      body.replaceChildren();
      if (S.tab === 'edit') renderEdit(body);
      else if (S.tab === 'preview') body.append(renderMessage(S.draft));
      else renderUse(body);
    };
    const renderTabs = () => {
      const closeBtn = el('button', { type: 'button', className: 'x', textContent: '✕', title: L.back2 });
      closeBtn.addEventListener('click', () => S.close());
      tabsEl.replaceChildren(...['edit', 'preview', 'use'].map((k) => {
        const b = el('button', { type: 'button', className: S.tab === k ? 'active' : '', textContent: L.tabs[k] });
        b.addEventListener('click', () => { S.tab = k; renderTabs(); renderBody(); });
        return b;
      }), closeBtn);
    };

    // ----- Speichern / Zurücksetzen / Schließen -----
    S.reset = () => { S.draft = clone(S.isNew ? S.initial : JSON.parse(S.original)); S.note = null; renderBody(); updateBar(); };
    S.save = async () => {
      const err = check(S.draft);
      if (err) { S.note = { text: err, kind: 'err' }; return updateBar(); }
      saveBtn.disabled = resetBtn.disabled = true;
      S.note = { text: L.saving2, kind: '' }; updateBar();
      try {
        const r = await post({ op: 'save', template: S.draft });
        let j = {}; try { j = await r.clone().json(); } catch {}
        const more = j.detail ? ` – ${j.detail}` : '';
        if (r.status === 401) S.note = { text: t('guilds_expired'), kind: 'err' };
        else if (r.status === 503) S.note = { text: `${L.noDb}${more}`, kind: 'err' };
        else if (r.status === 422) S.note = { text: L.badJson, kind: 'err' };
        else if (r.status === 409 || j.error === 'name_taken') S.note = { text: L.nameTaken, kind: 'err' };
        else if (j.error === 'too_many') S.note = { text: L.limitErr, kind: 'err' };
        else if (j.error === 'too_large') S.note = { text: L.tooLarge, kind: 'err' };
        else if (j.error === 'role_unassignable') S.note = { text: L.c.badRole('', j.role || '').replace(/^[^:]*: /, ''), kind: 'err' };
        else if (!r.ok) S.note = { text: `${L.saveErr}${j.error ? ` – ${j.error}` : ''}${more}`, kind: 'err' };
        else {
          S.draft = lnormTemplate(j.template);
          S.original = canon(S.draft);
          S.isNew = false;
          upsert(clone(S.draft));
          S.note = { text: L.saved, kind: 'ok' };
          renderBody();
          setTimeout(() => { S.note = null; updateBar(); }, 1600);
        }
      } catch { S.note = { text: L.saveErr, kind: 'err' }; }
      saveBtn.disabled = resetBtn.disabled = false;
      updateBar();
    };
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.dlg-ov')) S.close(); };
    S.close = async () => {
      if (S.busy) return;
      if (S.dirty() && !(await dialog({ title: L.discardTitle, text: L.discardText, confirm: L.discard, cancel: L.back2, danger: true }))) return;
      document.removeEventListener('keydown', onKey);
      ov.remove();
      document.body.style.overflow = '';
      ed = null;
      updateBar();
      renderList();
    };
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) S.close(); });

    ed = S;
    document.body.append(ov);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    renderTabs(); renderBody(); updateBar();
  }

  renderList();
})();
