(async () => {
  const { t } = window.I18N;
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

  try {
    const r = await fetch(`/api/guild?uid=${uid}&gid=${gid}`, { cache: 'no-store' });
    if (r.status === 401) return location.replace('/verify');
    if (r.status === 403) { msg.textContent = t('guilds_forbidden'); return; }
    if (r.status === 404) { msg.textContent = t('dash_nobot'); return; }
    if (!r.ok) throw new Error();
    const g = await r.json();
    const icon = g.icon
      ? make('img', { className: 'icon', alt: '', src: `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` })
      : make('div', { className: 'icon', textContent: g.name.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase() });
    const info = make('div', {}, make('h2', { textContent: g.name }));
    if (g.members != null) info.append(make('small', { textContent: `${g.members} ${t('dash_members')}` }));
    document.getElementById('head').append(make('div', { className: 'dash-head' }, icon, info));
    msg.textContent = t('dash_soon');
  } catch { msg.textContent = t('guilds_error'); }
})();
