(() => {
  const DICT = {
    de: {
      'nav.login': 'Einloggen',
      'nav.myServers': 'Meine Server',
      'nav.language': 'Sprache',
      'nav.logout': 'Logout',
      'nav.profile': 'Profilmenü öffnen',
      'nav.langMenu': 'Sprache wählen',
      'footer.privacy': 'Datenschutz',
      'footer.terms': 'Nutzungsbedingungen',
      'footer.legal': 'Impressum',
      'doc.germanOnly': 'Dieses Dokument ist nur auf Deutsch verfügbar.',
      'home.title': 'Astryx',
      'home.tagline': 'Der futuristische Discord-Bot für deine Community.',
      'home.cta': 'Jetzt verifizieren',
      'home.ctaServers': 'Zu meinen Servern',
      'verify.pageTitle': 'Verifizierung – Astryx',
      'verify.title': 'Verifizierung',
      'verify.intro': 'Autorisiere Astryx mit deinem Discord-Account. Folgende Berechtigungen werden angefragt:',
      'verify.required': 'Pflicht',
      'verify.recommended': 'Empfohlen',
      'verify.identify': 'Profil (identify)',
      'verify.identifyDesc': 'Name, ID und Profilbild, damit wir dich einloggen können.',
      'verify.guilds': 'Serverliste (guilds)',
      'verify.guildsDesc': 'Zeigt dir im Dashboard alle Server, auf denen du Inhaber oder Administrator bist.',
      'verify.join': 'Server beitreten (guilds.join)',
      'verify.joinDesc': 'Du wirst automatisch dem offiziellen Astryx-Server hinzugefügt.',
      'verify.agree': 'Ich akzeptiere die <a href="/terms-of-service" target="_blank">Nutzungsbedingungen</a> und habe die <a href="/privacy-policy" target="_blank">Datenschutzerklärung</a> gelesen.',
      'verify.button': 'Mit Discord autorisieren',
      'verify.waiting': 'Warte auf Discord …',
      'verify.already': 'Du bist bereits verifiziert.',
      'guilds.pageTitle': 'Server auswählen – Astryx',
      'guilds.title': 'Server auswählen',
      'guilds.subtitle': 'Es werden nur Server angezeigt, auf denen du Inhaber bist oder die Administrator-Berechtigung hast.',
      'guilds.search': 'Server suchen …',
      'guilds.searchLabel': 'Server suchen',
      'guilds.refresh': 'Aktualisieren',
      'guilds.loading': 'Server werden geladen …',
      'guilds.empty': 'Keine Server gefunden, auf denen du Inhaber oder Administrator bist.',
      'guilds.noMatch': 'Kein Server passt zu deiner Suche.',
      'guilds.error': 'Die Server konnten nicht geladen werden. Bitte versuche es erneut.',
      'guilds.rateLimited': 'Discord ist gerade ausgelastet. Bitte warte kurz und aktualisiere dann.',
      'guilds.waitingInvite': 'Warte auf die Einladung in Discord …',
      'guilds.configure': 'Zum Dashboard',
      'guilds.botError': 'Der Bot-Status konnte nicht geprüft werden. Bitte versuche es später erneut.',
      'guilds.invite': 'Bot einladen',
      'role.owner': 'Inhaber',
      'role.admin': 'Administrator',
      'dash.pageTitle': 'Dashboard – Astryx',
      'dash.back': 'Zurück zur Serverauswahl',
      'dash.members': 'Mitglieder',
      'dash.online': 'Online',
      'dash.yourRole': 'Deine Rolle',
      'dash.soonTitle': 'Dashboard in Arbeit',
      'dash.soon': 'Hier kannst du Astryx bald für deinen Server einrichten. Die Einstellungen folgen in Kürze.',
      'dash.loading': 'Server wird geladen …',
      'dash.forbidden': 'Du kannst diesen Server nur verwalten, wenn du Inhaber bist oder die Administrator-Berechtigung hast.',
      'dash.botMissing': 'Astryx ist noch nicht auf diesem Server.',
      'dash.error': 'Der Server konnte nicht geladen werden. Bitte versuche es erneut.',
    },
    en: {
      'nav.login': 'Log in',
      'nav.myServers': 'My servers',
      'nav.language': 'Language',
      'nav.logout': 'Log out',
      'nav.profile': 'Open profile menu',
      'nav.langMenu': 'Choose language',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms of Service',
      'footer.legal': 'Legal Notice',
      'doc.germanOnly': 'This document is currently only available in German.',
      'home.title': 'Astryx',
      'home.tagline': 'The futuristic Discord bot for your community.',
      'home.cta': 'Verify now',
      'home.ctaServers': 'Go to my servers',
      'verify.pageTitle': 'Verification – Astryx',
      'verify.title': 'Verification',
      'verify.intro': 'Authorize Astryx with your Discord account. The following permissions are requested:',
      'verify.required': 'Required',
      'verify.recommended': 'Recommended',
      'verify.identify': 'Profile (identify)',
      'verify.identifyDesc': 'Name, ID and avatar so we can log you in.',
      'verify.guilds': 'Server list (guilds)',
      'verify.guildsDesc': 'Shows all servers in the dashboard where you are the owner or an administrator.',
      'verify.join': 'Join servers (guilds.join)',
      'verify.joinDesc': 'You will automatically be added to the official Astryx server.',
      'verify.agree': 'I accept the <a href="/terms-of-service" target="_blank">Terms of Service</a> and have read the <a href="/privacy-policy" target="_blank">Privacy Policy</a>.',
      'verify.button': 'Authorize with Discord',
      'verify.waiting': 'Waiting for Discord …',
      'verify.already': 'You are already verified.',
      'guilds.pageTitle': 'Select a server – Astryx',
      'guilds.title': 'Select a server',
      'guilds.subtitle': 'Only servers where you are the owner or have the Administrator permission are shown.',
      'guilds.search': 'Search for your server …',
      'guilds.searchLabel': 'Search servers',
      'guilds.refresh': 'Refresh',
      'guilds.loading': 'Loading servers …',
      'guilds.empty': 'No servers found where you are the owner or an administrator.',
      'guilds.noMatch': 'No server matches your search.',
      'guilds.error': 'Could not load your servers. Please try again.',
      'guilds.rateLimited': 'Discord is busy right now. Please wait a moment and refresh.',
      'guilds.waitingInvite': 'Waiting for the invite in Discord …',
      'guilds.configure': 'Go to dashboard',
      'guilds.botError': 'Could not check the bot status. Please try again later.',
      'guilds.invite': 'Invite the bot',
      'role.owner': 'Owner',
      'role.admin': 'Administrator',
      'dash.pageTitle': 'Dashboard – Astryx',
      'dash.back': 'Back to server selection',
      'dash.members': 'Members',
      'dash.online': 'Online',
      'dash.yourRole': 'Your role',
      'dash.soonTitle': 'Dashboard in progress',
      'dash.soon': 'Soon you will be able to set up Astryx for your server here. Settings are coming shortly.',
      'dash.loading': 'Loading server …',
      'dash.forbidden': 'You can only manage this server if you are the owner or have the Administrator permission.',
      'dash.botMissing': 'Astryx is not on this server yet.',
      'dash.error': 'Could not load the server. Please try again.',
    },
  };
  const LANGS = [['de', 'Deutsch'], ['en', 'English (US)']];

  const readCookie = (n) => (document.cookie.match(new RegExp(`(?:^|; )${n}=([^;]*)`)) || [])[1];
  const saveLang = (l) => { document.cookie = `lang=${l}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`; };
  const detectLang = () => {
    const pref = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return pref.toLowerCase().startsWith('de') ? 'de' : 'en';
  };

  let lang = readCookie('lang');
  if (lang !== 'de' && lang !== 'en') { lang = detectLang(); saveLang(lang); }

  const t = (key, vars) => {
    let s = DICT[lang][key] ?? DICT.de[key] ?? key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll(`{${k}}`, v); });
    return s;
  };

  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k.startsWith('aria-') || k.startsWith('data-') || k === 'role') e.setAttribute(k, v);
      else e[k] = v;
    });
    kids.forEach(k => k != null && e.append(k));
    return e;
  };

  const applyTranslations = (root = document) => {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    root.querySelectorAll('[data-i18n-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
  };

  const setLang = (l) => {
    if (l === lang) return;
    saveLang(l);
    location.reload();
  };

  const avatarUrl = (u) => u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(u.id) >> 22n) % 6}.png`;

  const langOptions = () => make('div', { className: 'menu-langs', role: 'group', 'aria-label': t('nav.language') },
    ...LANGS.map(([code, label]) => make('button', {
      type: 'button',
      className: `menu-lang${code === lang ? ' active' : ''}`,
      'aria-pressed': String(code === lang),
      textContent: label,
      onclick: () => setLang(code),
    }))
  );

  const dropdown = (trigger, menu) => {
    const wrap = make('div', { className: 'menu-wrap' }, trigger, menu);
    const close = () => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); trigger.focus(); } });
    return wrap;
  };

  const header = make('header', { className: 'topbar' }, make('a', { className: 'brand', href: '/', textContent: 'Astryx' }));
  const right = make('div', { className: 'topbar-right' });
  header.append(right);
  document.body.prepend(header);

  const renderLoggedOut = () => {
    right.replaceChildren(
      dropdown(
        make('button', { type: 'button', className: 'lang-btn', textContent: lang.toUpperCase(), 'aria-label': t('nav.langMenu') }),
        make('div', { className: 'menu' }, make('p', { className: 'menu-label', textContent: t('nav.language') }), langOptions())
      ),
      make('a', { className: 'btn', href: '/verify', textContent: t('nav.login') })
    );
  };

  const renderLoggedIn = (u) => {
    const trigger = make('button', { type: 'button', className: 'profile-btn', 'aria-label': t('nav.profile') },
      make('img', { src: avatarUrl(u), alt: '', width: 34, height: 34 }),
      make('span', { className: 'name', textContent: u.name }),
      make('span', { className: 'chev', 'aria-hidden': 'true' })
    );
    const menu = make('div', { className: 'menu' },
      make('div', { className: 'menu-user' },
        make('img', { src: avatarUrl(u), alt: '', width: 40, height: 40 }),
        make('span', { textContent: u.name })
      ),
      make('a', { className: 'menu-item', href: `/${u.id}/guilds`, textContent: t('nav.myServers') }),
      make('p', { className: 'menu-label', textContent: t('nav.language') }),
      langOptions(),
      make('a', { className: 'menu-item danger', href: '/api/logout', textContent: t('nav.logout') })
    );
    right.replaceChildren(dropdown(trigger, menu));
  };

  const me = fetch('/api/me', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then(d => (d && d.user) || null)
    .catch(() => null);
  me.then(u => (u ? renderLoggedIn(u) : renderLoggedOut()));

  document.body.append(make('footer', { className: 'footer' },
    make('a', { href: '/privacy-policy', textContent: t('footer.privacy') }), ' · ',
    make('a', { href: '/terms-of-service', textContent: t('footer.terms') }), ' · ',
    make('a', { href: '/legal-notice', textContent: t('footer.legal') })
  ));

  const doc = document.querySelector('main.doc');
  if (doc && lang !== 'de') doc.prepend(make('p', { className: 'doc-note', textContent: t('doc.germanOnly') }));

  applyTranslations();
  window.Astryx = { t, lang, me, make, avatarUrl };
})();
