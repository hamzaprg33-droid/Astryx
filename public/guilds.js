(async () => {
  const { t } = window.I18N;
  const $ = (s) => document.querySelector(s);
  const make = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    kids.forEach(k => e.append(k));
    return e;
  };
  const ME = window.ME || fetch('/api/me').then(r => (r.ok ? r.json() : null)).then(d => (d && d.user) || null).catch(() => null);

  const uid = location.pathname.split('/')[1];
  const params = new URLSearchParams(location.search);
  const inviteCode = params.get('invite');
  const added = params.get('added');
  if (location.search) history.replaceState(null, '', location.pathname);

  // Beim erneuten Besuch sofort die zuletzt gesehene Liste zeigen und im Hintergrund aktualisieren
  const CK = `astryx:guilds:${uid}`;
  let all = [];
  if (!added) { try { const c = JSON.parse(sessionStorage.getItem(CK) || 'null'); if (Array.isArray(c)) all = c; } catch {} }

  const grid = $('#grid');
  const setStatus = (msg) => ($('#status').textContent = msg);
  const showExpired = () => {
    const st = $('#status');
    st.replaceChildren(make('div', { textContent: t('guilds_expired') }),
      make('a', { className: 'btn', style: 'margin-top:14px', href: '/api/verify', textContent: t('verify_again') }));
  };
  const initials = (n) => n.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();

  const render = () => {
    const q = $('#search').value.trim().toLowerCase();
    const list = all
      .filter(g => g.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.hasBot) - Number(a.hasBot) || a.name.localeCompare(b.name));
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

  // Platzhalter, solange noch nichts da ist
  const skeleton = () => grid.replaceChildren(...Array.from({ length: 8 }, () =>
    make('div', { className: 'card' }, make('div', { className: 'icon sk' }),
      make('div', { className: 'sk-line', style: 'width:70%' }), make('div', { className: 'sk-line', style: 'width:40%' }))));

  if (all.length) render(); else skeleton();

  // Serverliste sofort anfordern – GLEICHZEITIG mit der Login-Prüfung
  const fetchGuilds = () => fetch(`/api/guilds?uid=${uid}`, { cache: 'no-store' }).catch(() => null);
  const firstP = fetchGuilds();
  const me = await ME;
  if (!me) return location.replace('/verify');
  if (me.id !== uid) return location.replace(`/${me.id}/guilds`);

  if (inviteCode && /^[\w-]{2,32}$/.test(inviteCode)) {
    $('#notice').append(make('div', { className: 'notice' },
      make('div', { textContent: t('invite_banner') }),
      make('a', { className: 'btn', href: `https://discord.gg/${inviteCode}`, target: '_blank', rel: 'noopener', textContent: t('invite_join') })
    ));
  }

  const handle = async (r, tries) => {
    if (!r || !r.ok) {
      if (!all.length || (r && r.status < 500)) grid.replaceChildren();
      if (r && r.status === 401) return showExpired();
      if (r && r.status === 403) return setStatus(t('guilds_forbidden'));
      return setStatus(t('guilds_error'));
    }
    all = (await r.json()).guilds;
    try { sessionStorage.setItem(CK, JSON.stringify(all)); } catch {}
    render();
    // Nach dem Einladen kann Discord kurz brauchen -> noch ein paar Mal prüfen
    if (added && tries < 3 && !all.some(g => g.id === added && g.hasBot)) setTimeout(() => load(tries + 1), 2000);
  };
  const load = async (tries = 0) => { if (!all.length) skeleton(); await handle(await fetchGuilds(), tries); };

  $('#search').addEventListener('input', render);
  $('#refresh').addEventListener('click', () => { setStatus(t('guilds_loading')); load(); });
  await handle(await firstP, 0);
})();
