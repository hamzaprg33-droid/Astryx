(() => {
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };

  const footer = make('footer', { className: 'footer' },
    make('a', { href: '/datenschutz', textContent: 'Datenschutz' }), ' · ',
    make('a', { href: '/nutzungsbedingungen', textContent: 'Nutzungsbedingungen' }), ' · ',
    make('a', { href: '/impressum', textContent: 'Impressum' })
  );
  document.body.append(footer);

  const bar = make('div', { className: 'topbar' });
  document.body.prepend(bar);

  const loginBtn = () => bar.append(make('a', { className: 'btn', href: '/verify', textContent: 'Einloggen' }));

  fetch('/api/me')
    .then(r => (r.ok ? r.json() : null))
    .then(d => {
      if (d && d.user) {
        const u = d.user;
        const src = u.avatar
          ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
          : 'https://cdn.discordapp.com/embed/avatars/0.png';
        bar.append(
          make('img', { src, alt: '' }),
          make('span', { className: 'name', textContent: u.name }),
          make('a', { className: 'out', href: '/api/logout', textContent: 'Logout' })
        );
      } else loginBtn();
    })
    .catch(loginBtn);
})();
