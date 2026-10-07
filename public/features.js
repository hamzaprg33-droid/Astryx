// Kategorien & Funktionen des Dashboards.
// Freischalten:  active: true          -> Karte wird hell und klickbar
// Tags setzen:   tags: ['new', 'beta', 'experimental', 'build']   ('build' sperrt die Karte)
// Funktionen:    features: [{ name: n('Deutsch', 'English'), tags: ['beta'] }]
window.FEATURES = (() => {
  const L = window.I18N.lang;
  const pick = (o) => o[L] ?? o.en;
  const n = (de, en) => ({ de, en });

  const tagDefs = {
    new:          { label: 'NEW',          desc: n('Neue Kategorie oder neue Funktionen', 'New category or new features') },
    beta:         { label: 'BETA',         desc: n('Noch nicht vollständig getestet oder nur teilweise fertig', 'Not fully tested or only partially finished') },
    experimental: { label: L === 'de' ? 'EXPERIMENTELL' : 'EXPERIMENTAL', desc: n('Benötigt APIs oder besondere Berechtigungen', 'Requires APIs or special permissions') },
    build:        { label: 'IN BUILD',     desc: n('Gesperrt wegen Wartungsarbeiten', 'Locked due to maintenance') },
  };

  const ui = {
    de: { active: 'Astryx ist aktiv', soon: 'Bald verfügbar', maint: 'Wartungsarbeiten', legend: 'Legende', configure: 'Konfigurieren' },
    en: { active: 'Astryx is active', soon: 'Coming soon', maint: 'Under maintenance', legend: 'Legend', configure: 'Configure' },
  }[L];

  const cat = (id, ico, name, desc, o = {}) =>
    ({ id, ico: ico + '\uFE0E', name, desc, active: false, tags: [], features: [], ...o });
  const feat = (name, tags = []) => ({ name, tags });

  const sections = [
    { title: n('Sicherheit', 'Security'), cats: [
      cat('automod', '⛨', n('Auto-Moderation', 'Auto Moderation'),
        n('Spam, Links und Regelverstöße automatisch erkennen', 'Detect spam, links and rule breaks automatically'),
        { features: [feat(n('KI-Moderation', 'AI moderation'))] }),
      cat('moderation', '⚔', n('Moderation', 'Moderation'),
        n('Verwarnungen, Fälle und Meldungen verwalten', 'Manage warnings, cases and reports'),
        { features: [feat(n('Moderations-Fälle', 'Moderation cases')), feat(n('Nutzer-Meldungen', 'User reports'))] }),
      cat('logging', '☰', n('Logging', 'Logging'),
        n('Server-Ereignisse protokollieren', 'Log events on your server')),
    ] },
    { title: n('Community', 'Community'), cats: [
      cat('welcome', '✦', n('Willkommensnachrichten', 'Welcome Messages'),
        n('Begrüßungen und Verabschiedungen für Mitglieder', 'Greetings and farewells for members'),
        { active: true, page: 'welcomer',
          features: [feat(n('Willkommer', 'Welcomer'), ['beta']), feat(n('Rollen-Begrüßungen', 'Role greetings'))] }),
      cat('joinroles', '➜', n('Beitritts-Rollen', 'Join Roles'),
        n('Neuen Mitgliedern automatisch Rollen geben', 'Give new members roles automatically')),
      cat('reactionroles', '☺', n('Reaktions-Rollen', 'Reaction Roles'),
        n('Rollen per Reaktion oder Button vergeben', 'Hand out roles via reactions or buttons')),
      cat('roleconnections', '⚯', n('Rollen-Verknüpfungen', 'Role Connections'),
        n('Rollen mit externen Konten verknüpfen', 'Link roles to external accounts')),
      cat('social', '◉', n('Social-Benachrichtigungen', 'Social Notifications'),
        n('Meldungen zu Streams, Videos und Posts', 'Alerts for streams, videos and posts')),
    ] },
    { title: n('Anpassung', 'Customization'), cats: [
      cat('general', '⚙', n('Allgemein', 'General Settings'),
        n('Grundeinstellungen deines Servers', 'Basic settings for your server')),
      cat('commands', '⌘', n('Commands', 'Commands'),
        n('Commands aktivieren und anpassen', 'Enable and customize commands'),
        { features: [feat(n('Prefixes', 'Prefixes'))] }),
      cat('messages', '✉', n('Nachrichten', 'Messages'),
        n('Eigene Vorlagen mit Embeds und Buttons', 'Custom templates with embeds and buttons'),
        { features: [feat(n('Eigene Nachrichten', 'Custom messages'))] }),
      cat('branding', '◈', n('Branding', 'Custom Branding'),
        n('Name, Avatar und Look des Bots anpassen', 'Customize the bot\'s name, avatar and look')),
    ] },
  ];

  // [TAG]-Element. inline = neben einem Titel, sonst oben rechts an der Karte
  const tag = (key, inline = false) => {
    const d = tagDefs[key];
    const el = document.createElement('span');
    el.className = `ctag ${key}${inline ? ' inline' : ''}`;
    el.textContent = `[${d.label}]`;
    el.title = pick(d.desc);
    return el;
  };

  return { pick, ui, tagDefs, sections, tag };
})();
