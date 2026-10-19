(async () => {
  const { t } = window.I18N;
  const F = window.FEATURES;
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };
  const ME = window.ME || fetch('/api/me').then(r => (r.ok ? r.json() : null)).then(d => (d && d.user) || null).catch(() => null);

  const [uid, gid] = location.pathname.split('/').filter(Boolean);
  document.getElementById('back').href = `/${uid}/guilds`;
  const msg = document.getElementById('msg');
  const head = document.getElementById('head');
  const content = document.getElementById('content');

  // Link-Ziele: der sichere Weg zuerst; die kurze Adresse wird nachträglich eingesetzt, wenn der Server sie kennt
  const links = [];
  const card = (c) => {
    const open = c.active && !c.tags.includes('build');
    const el = make('div', { className: 'cat' + (open ? ' on' : ' off') });
    if (!open) el.setAttribute('aria-disabled', 'true');

    el.append(make('div', { className: 'top' },
      make('div', { className: 'ico', textContent: c.ico }),
      make('div', { className: 'tags' }, ...c.tags.map(k => F.tag(k)))
    ));
    el.append(make('h3', { textContent: F.pick(c.name) }), make('p', { textContent: F.pick(c.desc) }));

    if (c.features.length) {
      el.append(make('div', { className: 'feats' }, ...c.features.map(f =>
        make('div', { className: 'feat' }, F.pick(f.name), ...f.tags.map(k => F.tag(k, true))))));
    }
    if (open) {
      const page = c.page || c.id;
      const a = make('a', { className: 'btn cfg', href: `/${page}?uid=${uid}&gid=${gid}`, textContent: F.ui.configure });
      links.push({ a, page });
      el.append(a);
    } else {
      el.append(make('div', { className: 'soon', textContent: c.tags.includes('build') ? F.ui.maint : F.ui.soon }));
    }
    return el;
  };

  // ---------- 1) SOFORT anzeigen: die Kategorien hängen nicht von Serverdaten ab ----------
  head.append(make('div', { className: 'dash-head' },
    make('div', { className: 'icon sk' }),
    make('div', {}, make('div', { className: 'sk-line', style: 'width:200px' }), make('div', { className: 'sk-line', style: 'width:120px;margin-top:10px' }))));
  F.sections.forEach(s => {
    content.append(make('div', { className: 'sec-title', textContent: F.pick(s.title) }));
    content.append(make('div', { className: 'cats' }, ...s.cats.map(card)));
  });
  content.append(make('div', { className: 'sec-title', textContent: F.ui.legend }));
  content.append(make('div', { className: 'legend' }, ...Object.keys(F.tagDefs).map(k =>
    make('div', { className: 'legend-row' }, F.tag(k), make('span', { textContent: F.pick(F.tagDefs[k].desc) })))));

  // Kurze Adressen im Hintergrund prüfen und dann einsetzen
  links.forEach(({ a, page }) =>
    fetch(`/${uid}/${gid}/${page}`, { method: 'HEAD', cache: 'no-store' })
      .then(r => { if (r.ok) a.href = `/${uid}/${gid}/${page}`; }).catch(() => {}));

  // ---------- 2) Login-Prüfung und Serverdaten GLEICHZEITIG ----------
  const guildP = fetch(`/api/guild?uid=${uid}&gid=${gid}`, { cache: 'no-store' }).catch(() => null);
  const me = await ME;
  if (!me) return location.replace('/verify');
  if (me.id !== uid) return location.replace(`/${me.id}/guilds`);

  const stop = (text) => { head.replaceChildren(); content.replaceChildren(); msg.textContent = text; };
  const r = await guildP;
  if (!r) return stop(t('guilds_error'));
  if (r.status === 401) return stop(t('guilds_expired'));
  if (r.status === 403) return stop(t('guilds_forbidden'));
  if (r.status === 404) return stop(t('dash_nobot'));
  if (!r.ok) return stop(t('guilds_error'));
  const g = await r.json();

  const icon = g.icon
    ? make('img', { className: 'icon', alt: '', src: `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` })
    : make('div', { className: 'icon', textContent: g.name.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase() });
  const meta = make('div', { className: 'meta' }, make('span', { className: 'live', textContent: F.ui.active }));
  if (g.members != null) meta.append(make('span', { textContent: `${g.members} ${t('dash_members')}` }));
  head.replaceChildren(make('div', { className: 'dash-head' }, icon, make('div', {}, make('h2', { textContent: g.name }), meta)));
})();
