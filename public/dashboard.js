(async () => {
  const { t } = window.I18N;
  const F = window.FEATURES;
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };

  const [uid, gid] = location.pathname.split('/').filter(Boolean);
  document.getElementById('back').href = `/${uid}/guilds`;
  const msg = document.getElementById('msg');

  let me = null;
  try { const r = await fetch('/api/me'); if (r.ok) me = (await r.json()).user; } catch {}
  if (!me) return location.replace('/verify');
  if (me.id !== uid) return location.replace(`/${me.id}/guilds`);

  const card = (c) => {
    const clickable = c.active && !c.tags.includes('build');
    const el = make(clickable ? 'a' : 'div', { className: 'cat' + (clickable ? '' : ' off') });
    if (clickable) el.href = `/${uid}/${gid}/${c.id}`;
    else el.setAttribute('aria-disabled', 'true');

    el.append(make('div', { className: 'top' },
      make('div', { className: 'ico', textContent: c.ico }),
      make('div', { className: 'tags' }, ...c.tags.map(k => F.tag(k)))
    ));
    el.append(make('h3', { textContent: F.pick(c.name) }), make('p', { textContent: F.pick(c.desc) }));

    if (c.features.length) {
      el.append(make('div', { className: 'feats' }, ...c.features.map(f =>
        make('div', { className: 'feat' }, F.pick(f.name), ...f.tags.map(k => F.tag(k, true))))));
    }
    if (!clickable) {
      el.append(make('div', { className: 'soon', textContent: c.tags.includes('build') ? F.ui.maint : F.ui.soon }));
    }
    return el;
  };

  try {
    const r = await fetch(`/api/guild?uid=${uid}&gid=${gid}`, { cache: 'no-store' });
    if (r.status === 401) { msg.textContent = t('guilds_expired'); return; }
    if (r.status === 403) { msg.textContent = t('guilds_forbidden'); return; }
    if (r.status === 404) { msg.textContent = t('dash_nobot'); return; }
    if (!r.ok) throw new Error();
    const g = await r.json();

    const icon = g.icon
      ? make('img', { className: 'icon', alt: '', src: `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` })
      : make('div', { className: 'icon', textContent: g.name.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase() });
    const meta = make('div', { className: 'meta' }, make('span', { className: 'live', textContent: F.ui.active }));
    if (g.members != null) meta.append(make('span', { textContent: `${g.members} ${t('dash_members')}` }));
    document.getElementById('head').append(
      make('div', { className: 'dash-head' }, icon, make('div', {}, make('h2', { textContent: g.name }), meta))
    );

    const content = document.getElementById('content');
    F.sections.forEach(s => {
      content.append(make('div', { className: 'sec-title', textContent: F.pick(s.title) }));
      content.append(make('div', { className: 'cats' }, ...s.cats.map(card)));
    });

    // Legende der Tags
    content.append(make('div', { className: 'sec-title', textContent: F.ui.legend }));
    content.append(make('div', { className: 'legend' }, ...Object.keys(F.tagDefs).map(k =>
      make('div', { className: 'legend-row' }, F.tag(k), make('span', { textContent: F.pick(F.tagDefs[k].desc) })))));
  } catch { msg.textContent = t('guilds_error'); }
})();
