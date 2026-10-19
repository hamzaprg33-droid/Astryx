const { getFreshSession, seal, unseal, parseCookies } = require('./session');
const { manageableGuilds } = require('./discord');

const TTL = 10 * 60 * 1000; // so lange gilt "darf diesen Server verwalten", ohne Discord erneut zu fragen

const addCookie = (res, c) => {
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(prev ? [].concat(prev) : []), c]);
};

// Prüft: eingeloggt, richtige User-ID, Server verwaltbar (Inhaber/Administrator).
// Antwortet bei Fehlern selbst und gibt dann null zurück.
async function guildAccess(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { uid, gid } = req.query;
  const s = await getFreshSession(req, res);
  if (!s) { res.status(401).json({ error: 'no_session' }); return null; }
  if (uid !== s.id || !/^\d+$/.test(gid || '')) { res.status(403).json({ error: 'forbidden' }); return null; }

  // Verschlüsselter, 10 Minuten gültiger Merkzettel: spart die langsame Discord-Abfrage bei jeder Seite
  const raw = parseCookies(req).gok;
  const c = raw ? unseal(raw) : null;
  const valid = !!(c && c.u === s.id && c.e > Date.now() && Array.isArray(c.g));

  if (!(valid && c.g.includes(gid))) {
    try {
      const mine = await manageableGuilds(res, s);
      if (!mine.some(g => g.id === gid)) { res.status(403).json({ error: 'forbidden' }); return null; }
    } catch (e) {
      res.status(e.code === 'token' ? 401 : 502).json({ error: e.code === 'token' ? 'token' : 'discord', detail: e.detail || '' });
      return null;
    }
    const g = valid ? [...c.g, gid].slice(-20) : [gid];
    const e = valid ? c.e : Date.now() + TTL;
    addCookie(res, `gok=${seal({ u: s.id, g, e })}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=${Math.max(1, Math.floor((e - Date.now()) / 1000))}`);
  }
  return { s, gid };
}

module.exports = { guildAccess };
