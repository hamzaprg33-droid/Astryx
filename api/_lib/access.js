const { getFreshSession } = require('./session');
const { manageableGuilds } = require('./discord');

// Prüft: eingeloggt, richtige User-ID, Server verwaltbar (Inhaber/Administrator).
// Antwortet bei Fehlern selbst und gibt dann null zurück.
async function guildAccess(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { uid, gid } = req.query;
  const s = await getFreshSession(req, res);
  if (!s) { res.status(401).json({ error: 'no_session' }); return null; }
  if (uid !== s.id || !/^\d+$/.test(gid || '')) { res.status(403).json({ error: 'forbidden' }); return null; }
  try {
    const mine = await manageableGuilds(res, s);
    if (!mine.some(g => g.id === gid)) { res.status(403).json({ error: 'forbidden' }); return null; }
  } catch (e) {
    res.status(e.code === 'token' ? 401 : 502).json({ error: e.code === 'token' ? 'token' : 'discord', detail: e.detail || '' });
    return null;
  }
  return { s, gid };
}

module.exports = { guildAccess };
