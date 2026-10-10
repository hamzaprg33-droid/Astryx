// Speichert Server-Einstellungen als Dateien im GitHub-Repo der Website:
//   Guild Data/<Server_Name>_<SERVER_ID>/guild_data.json
// (Vercel selbst darf zur Laufzeit keine Dateien schreiben – daher die GitHub-API.)
const ROOT = 'Guild Data';
const FILE = 'guild_data.json';

// Leerzeichen, Zeilenumbrüche und Anführungszeichen vom Einfügen entfernen; auch ganze GitHub-URLs sind ok
const clean = (v) => String(v || '').trim().replace(/^["']+|["']+$/g, '').trim();
const cfg = () => ({
  token: clean(process.env.GITHUB_TOKEN),
  repo: clean(process.env.GITHUB_REPO).replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, ''),
  branch: clean(process.env.GITHUB_BRANCH) || 'main',
});

const fail = (code, status, detail) => { const e = new Error(code); e.code = code; e.status = status; e.detail = detail; return e; };
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

async function gh(path, init = {}) {
  const { token, repo } = cfg();
  const missing = [!token && 'GITHUB_TOKEN', !repo && 'GITHUB_REPO'].filter(Boolean);
  if (missing.length) throw fail('no_db', 0, `Fehlt in Vercel: ${missing.join(', ')}`);
  return fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'astryx-dashboard',
      ...(init.headers || {}),
    },
  });
}

// Wirft einen Fehler mit der Original-Meldung von GitHub (z. B. "Bad credentials")
async function check(r) {
  if (r.ok) return;
  let msg = '';
  try { msg = (await r.clone().json()).message || ''; } catch {}
  throw fail(r.status === 401 || r.status === 403 ? 'db_auth' : 'db', r.status, `GitHub ${r.status}: ${String(msg).slice(0, 160)}`);
}

// "Magdeburg RP" -> "Magdeburg_RP"
const safeName = (name) =>
  String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Server';

// Ordner des Servers finden – egal wie er heißt, solange er auf _<SERVER_ID> endet
async function findFolder(gid) {
  const r = await gh(`${enc(ROOT)}?ref=${encodeURIComponent(cfg().branch)}`);
  if (r.status === 404) {
    // 404 = Ordner existiert noch nicht ... ODER Token/Repo stimmen nicht. Das unterscheiden wir hier.
    const repo = await fetch(`https://api.github.com/repos/${cfg().repo}`, {
      headers: { Authorization: `Bearer ${cfg().token}`, 'User-Agent': 'astryx-dashboard' },
    });
    if (!repo.ok) throw fail('db_auth', repo.status, `GitHub ${repo.status}: Repo "${cfg().repo}" nicht gefunden oder Token ohne Zugriff`);
    return null;
  }
  await check(r);
  const list = await r.json();
  if (!Array.isArray(list)) throw fail('db', 0, `"${ROOT}" ist keine Ordner-Struktur im Repo`);
  const hit = list.find(x => x.type === 'dir' && (x.name === gid || x.name.endsWith('_' + gid)));
  return hit ? hit.name : null;
}

async function readGuild(gid) {
  const folder = await findFolder(gid);
  if (!folder) return null;
  const r = await gh(`${enc(`${ROOT}/${folder}/${FILE}`)}?ref=${encodeURIComponent(cfg().branch)}`);
  if (r.status === 404) return { folder, data: {}, sha: null };
  await check(r);
  const j = await r.json();
  let data;
  try { data = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')); }
  catch { throw fail('bad_json'); }   // Datei von Hand kaputt bearbeitet -> NICHT überschreiben
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw fail('bad_json');
  return { folder, data, sha: j.sha };
}

// Liest die Datei, wendet mutate() auf die Funktions-Daten an und schreibt sie zurück.
// Unbekannte Felder (z. B. von Developern ergänzt) bleiben erhalten.
async function updateGuild(gid, guildName, mutate) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const cur = await readGuild(gid);
    const folder = cur ? cur.folder : `${safeName(guildName)}_${gid}`;
    const { guild_id, server_name, updated_at, ...rest } = (cur && cur.data) || {};
    mutate(rest);
    const out = { guild_id: gid, server_name: guildName, updated_at: new Date().toISOString(), ...rest };

    const body = {
      message: `Astryx: ${String(guildName).replace(/\s+/g, ' ').slice(0, 60)} (${gid}) aktualisiert`,
      content: Buffer.from(JSON.stringify(out, null, 2) + '\n').toString('base64'),
      branch: cfg().branch,
    };
    if (cur && cur.sha) body.sha = cur.sha;

    const r = await gh(enc(`${ROOT}/${folder}/${FILE}`), { method: 'PUT', body: JSON.stringify(body) });
    if ((r.status === 409 || r.status === 422) && attempt === 0) continue; // parallel geändert -> nochmal
    if (r.status === 404) throw fail('db_auth', 404, `GitHub 404: Repo, Branch "${cfg().branch}" oder Token-Rechte (Contents: Read and write) prüfen`);
    await check(r);
    return out;
  }
  throw fail('db', 0, 'GitHub: Konflikt beim Speichern');
}

module.exports = { readGuild, updateGuild, safeName, ROOT, FILE };
