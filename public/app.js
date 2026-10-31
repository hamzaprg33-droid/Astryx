(() => {
  const I = window.I18N;
  const t = I.t;
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };

  I.apply();

  // Tab-Symbol (Favicon) für ALLE Seiten: public/logo.png
  // "?v=1" hochzählen, wenn du das Logo austauschst – Browser merken sich Tab-Symbole sehr hartnäckig.
  ['icon', 'apple-touch-icon'].forEach((rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) { link = document.createElement('link'); link.rel = rel; document.head.append(link); }
    if (rel === 'icon') link.type = 'image/png';
    link.href = '/logo.png?v=1';
  });

  // Footer: Datenschutz · Nutzungsbedingungen · Impressum
  document.body.append(make('footer', { className: 'footer' },
    make('a', { href: '/privacy-policy', textContent: t('footer_privacy') }), ' · ',
    make('a', { href: '/terms-of-service', textContent: t('footer_terms') }), ' · ',
    make('a', { href: '/legal-notice', textContent: t('footer_legal') })
  ));

  const bar = make('div', { className: 'topbar' });
  document.body.prepend(bar);

  const loginBtn = () => bar.append(make('a', { className: 'btn', href: '/verify', textContent: t('nav_login') }));

  const userMenu = (u) => {
    const src = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';
    const btn = make('button', { className: 'profile', type: 'button' },
      make('img', { src, alt: '' }),
      make('span', { className: 'name', textContent: u.name }),
      make('span', { className: 'caret', textContent: '▾' })
    );
    const langRow = make('div', { className: 'menu-lang' }, make('span', { className: 'menu-label', textContent: t('nav_language') }));
    [['de', 'Deutsch'], ['en', 'English (US)']].forEach(([code, label]) => {
      const b = make('button', { type: 'button', className: 'lang' + (I.lang === code ? ' active' : ''), textContent: label });
      b.addEventListener('click', () => I.set(code));
      langRow.append(b);
    });
    const menu = make('div', { className: 'menu' },
      make('a', { href: `/${u.id}/guilds`, textContent: t('nav_servers') }),
      langRow,
      make('a', { href: '/api/logout', textContent: t('nav_logout') })
    );
    menu.hidden = true;
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
    menu.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => (menu.hidden = true));
    return make('div', { className: 'profile-wrap' }, btn, menu);
  };

  // Login-Status EINMAL laden; die Seiten-Skripte benutzen dasselbe Ergebnis (window.ME)
  window.ME = fetch('/api/me')
    .then(r => (r.ok ? r.json() : null))
    .then(d => (d && d.user) || null)
    .catch(() => null);
  window.ME.then(u => (u ? bar.append(userMenu(u)) : loginBtn()));

  // Mitteilung bei aktualisierten Nutzungsbedingungen / Datenschutz.
  // Nur für bereits eingeloggte Nutzer (neue Nutzer bekommen das Cookie beim ersten Login).
  // Aktuelle Fassung – bei der nächsten Änderung hier hochzählen.
  const LEGAL_VERSION = '2026-10-31';
  const hasLegal = () => document.cookie.split(';').some(c => c.trim() === `legal=${LEGAL_VERSION}`);
  const acceptLegal = () => {
    document.cookie = `legal=${LEGAL_VERSION}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  };

  window.ME.then(u => {
    if (!u || hasLegal()) return;
    const ov = make('div', { className: 'ov legal-ov' });
    const box = make('div', { className: 'dlg legal-dlg' },
      make('h3', { textContent: t('legal_title') }),
      make('p', { className: 'hint', textContent: t('legal_text') }),
      make('div', { className: 'legal-links' },
        make('a', { href: '/terms-of-service', target: '_blank', textContent: t('legal_terms') }),
        ' · ',
        make('a', { href: '/privacy-policy', target: '_blank', textContent: t('legal_privacy') })
      ),
      make('button', { className: 'btn', type: 'button', textContent: t('legal_accept') })
    );
    box.querySelector('button').addEventListener('click', () => {
      acceptLegal();
      ov.remove();
    });
    ov.append(box);
    document.body.append(ov);
  });
})();
