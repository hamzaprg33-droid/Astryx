(async () => {
  const { t } = window.I18N;
  const $ = (s) => document.querySelector(s);
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };

  const uid = location.pathname.split('/')[1];
  const params = new URLSearchParams(location.search);
  const inviteCode = params.get('invite');
  const added = params.get('added');
  if (location.search) history.replaceState(null, '', location.pathname);

  // Zugriff: nur der eingeloggte User sieht seine eigene Seite
  let me = null;
  try { const r = await fetch('/api/me'); if (r.ok) me = (await r.json()).user; } catch {}
  if (!me) return location.replace('/verify');
  if (me.id !== uid) return location.replace(`/${me.id}/guilds`);

  if (inviteCode && /^[\w-]{2,32}$/.test(inviteCode)) {
    $('#notice').append(make('div', { className: 'notice' },
      make('div', { textContent: t('invite_banner') }),
      make('a', { className: 'btn', href: `https://discord.gg/${inviteCode}`, target: '_blank', rel: 'noopener', textContent: t('invite_join') })
    ));
  }

  const setStatus = (msg) => ($('#status').textContent = msg);
  const initials = (n) => n.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();

  let all = [];

  const render = () => {
    const q = $('#search').value.trim().toLowerCase();
    const list = all
      .filter(g => g.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.hasBot) - Number(a.hasBot) || a.name.localeCompare(b.name));
    const grid = $('#grid');
    grid.replaceChildren();
    if (!list.length) { setStatus(all.length ? '' : t('guilds_empty')); return; }
    setStatus('');
    list.forEach(g => {
      const icon = g.icon
        ? make('img', { className: 'icon', alt: '', src: `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith('a_') ? 'gif' : 'png'}?size=128` })
        : make('div', { className: 'icon', textContent: initials(g.name) });
      const btn = g.hasBot
        ? make('a', { className: 'btn', href: `/${uid}/${g.id}`, textContent: t('guilds_configure') })
        : make('a', { className: 'btn', href: `/api/invite?gid=${g.id}`, textContent: t('guilds_invite') });
      grid.append(make('div', { className: 'card' + (g.hasBot ? '' : ' off') },
        icon,
        make('div', { className: 'gname', textContent: g.name }),
        make('span', { className: 'tag rec', textContent: t(g.role === 'owner' ? 'role_owner' : 'role_admin') }),
        btn
      ));
    });
  };

  const load = async (tries = 0) => {
    setStatus(t('guilds_loading'));
    try {
      const r = await fetch(`/api/guilds?uid=${uid}`, { cache: 'no-store' });
      if (r.status === 401) return location.replace('/verify');
      if (r.status === 403) return setStatus(t('guilds_forbidden'));
      if (!r.ok) throw new Error();
      all = (await r.json()).guilds;
      render();
      // Nach dem Einladen kann Discord kurz brauchen -> noch ein paar Mal prüfen
      if (added && tries < 3 && !all.some(g => g.id === added && g.hasBot)) setTimeout(() => load(tries + 1), 2000);
    } catch { setStatus(t('guilds_error')); }
  };

  $('#search').addEventListener('input', render);
  $('#refresh').addEventListener('click', () => load());
  load();
})();
