// Wird im <head> geladen, damit die Sprache gesetzt ist, bevor etwas angezeigt wird.
(() => {
  const dict = {
    de: {
      nav_login: 'Einloggen', nav_logout: 'Logout', nav_servers: 'Meine Server', nav_language: 'Sprache',
      footer_privacy: 'Datenschutz', footer_terms: 'Nutzungsbedingungen', footer_legal: 'Impressum',
      title_verify: 'Verifizierung', title_privacy: 'Datenschutz', title_terms: 'Nutzungsbedingungen',
      title_legal: 'Impressum', title_guilds: 'Server auswählen', title_dashboard: 'Dashboard',
      tag_required: 'Pflicht',
      verify_intro: 'Autorisiere Astryx mit deinem Discord-Account. Folgende Berechtigungen werden angefragt:',
      perm_profile_t: 'Profil (identify)', perm_profile_d: 'Name, ID und Profilbild – damit wir dich einloggen können.',
      perm_guilds_t: 'Serverliste (guilds)', perm_guilds_d: 'Zeigt die Server, die du verwalten kannst – nötig für das Dashboard.',
      perm_join_t: 'Hauptserver beitreten (guilds.join)', perm_join_d: 'Du wirst automatisch unserem Discord-Server hinzugefügt – dort gibt es Support, Neuigkeiten und Feedback.',
      verify_accept: 'Ich akzeptiere die <a href="/terms-of-service" target="_blank">Nutzungsbedingungen</a> und habe die <a href="/privacy-policy" target="_blank">Datenschutzerklärung</a> gelesen.',
      verify_btn: 'Mit Discord autorisieren', verify_done: 'Du bist bereits verifiziert. ✔', verify_home: 'Meine Server',
      guilds_title: 'Server auswählen', guilds_search: 'Server suchen…', guilds_refresh: 'Aktualisieren',
      guilds_configure: 'Konfigurieren', guilds_invite: 'Bot einladen', role_owner: 'Inhaber', role_admin: 'Admin',
      guilds_empty: 'Keine Server gefunden. Du musst Inhaber sein oder Administrator-Rechte haben.',
      guilds_loading: 'Lade Server…', guilds_error: 'Die Server konnten nicht geladen werden. Bitte versuche es erneut.',
      guilds_forbidden: 'Du hast keinen Zugriff auf diese Seite.',
      guilds_expired: 'Deine Discord-Verbindung ist abgelaufen. Bitte verifiziere dich erneut.',
      verify_again: 'Neu verifizieren',
      invite_banner: 'Wir konnten dich nicht automatisch zu unserem Discord-Server hinzufügen. Tritt hier mit deinem persönlichen Einladungslink bei:',
      invite_join: 'Server beitreten',
      dash_title: 'Dashboard', dash_soon: 'Hier entstehen bald die Einstellungen für deinen Server.',
      dash_back: 'Zurück zur Serverliste', dash_members: 'Mitglieder', dash_nobot: 'Astryx ist auf diesem Server nicht aktiv.',
    },
    en: {
      nav_login: 'Log in', nav_logout: 'Log out', nav_servers: 'My servers', nav_language: 'Language',
      footer_privacy: 'Privacy Policy', footer_terms: 'Terms of Service', footer_legal: 'Legal Notice',
      title_verify: 'Verification', title_privacy: 'Privacy Policy', title_terms: 'Terms of Service',
      title_legal: 'Legal Notice', title_guilds: 'Select a Server', title_dashboard: 'Dashboard',
      tag_required: 'Required',
      verify_intro: 'Authorize Astryx with your Discord account. The following permissions are requested:',
      perm_profile_t: 'Profile (identify)', perm_profile_d: 'Name, ID and avatar – so we can log you in.',
      perm_guilds_t: 'Server list (guilds)', perm_guilds_d: 'Shows the servers you can manage – required for the dashboard.',
      perm_join_t: 'Join main server (guilds.join)', perm_join_d: 'You are automatically added to our Discord server – support, news and feedback.',
      verify_accept: 'I accept the <a href="/terms-of-service" target="_blank">Terms of Service</a> and have read the <a href="/privacy-policy" target="_blank">Privacy Policy</a>.',
      verify_btn: 'Authorize with Discord', verify_done: 'You are already verified. ✔', verify_home: 'My servers',
      guilds_title: 'Select a Server', guilds_search: 'Search servers…', guilds_refresh: 'Refresh',
      guilds_configure: 'Configure', guilds_invite: 'Invite the bot', role_owner: 'Owner', role_admin: 'Admin',
      guilds_empty: 'No servers found. You must be the owner or have Administrator permission.',
      guilds_loading: 'Loading servers…', guilds_error: 'Servers could not be loaded. Please try again.',
      guilds_forbidden: 'You do not have access to this page.',
      guilds_expired: 'Your Discord connection has expired. Please verify again.',
      verify_again: 'Re-verify',
      invite_banner: 'We could not add you to our Discord server automatically. Join with your personal invite link here:',
      invite_join: 'Join server',
      dash_title: 'Dashboard', dash_soon: 'Settings for your server are coming soon.',
      dash_back: 'Back to server list', dash_members: 'Members', dash_nobot: 'Astryx is not active on this server.',
    },
  };

  const m = document.cookie.match(/(?:^|; )lang=(de|en)/);
  const browser = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
  const lang = m ? m[1] : (browser.startsWith('de') ? 'de' : 'en');

  document.documentElement.lang = lang === 'de' ? 'de' : 'en-US';
  document.documentElement.dataset.lang = lang;

  window.I18N = {
    lang,
    t: (k) => dict[lang][k] ?? dict.en[k] ?? k,
    set(l) {
      document.cookie = `lang=${l}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
      location.reload();
    },
    apply() {
      document.querySelectorAll('[data-i18n]').forEach(el => (el.textContent = this.t(el.dataset.i18n)));
      document.querySelectorAll('[data-i18n-html]').forEach(el => (el.innerHTML = this.t(el.dataset.i18nHtml)));
      document.querySelectorAll('[data-i18n-ph]').forEach(el => (el.placeholder = this.t(el.dataset.i18nPh)));
      const key = document.body.dataset.title;
      if (key) document.title = `${this.t('title_' + key)} – Astryx`;
    },
  };
})();
