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

  fetch('/api/me')
    .then(r => (r.ok ? r.json() : null))
    .then(d => (d && d.user ? bar.append(userMenu(d.user)) : loginBtn()))
    .catch(loginBtn);
})();
