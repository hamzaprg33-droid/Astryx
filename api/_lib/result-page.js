const { strings } = require('./i18n');

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// Rendered inside the second tab. It notifies the original tab and then closes itself.
module.exports = (res, { lang, kind = 'auth', ok, title, messages = [], link, next, data = {}, autoClose = true, status = 200 }) => {
  const T = strings(lang);
  const payload = { type: `astryx-${kind}`, ok, ...data };
  const heading = title || (ok ? T.verifiedTitle : T.errorTitle);
  res.status(status);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(heading)} – Astryx</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <h2 class="page-title">${escapeHtml(heading)}</h2>
    <div class="panel">
      ${messages.map(m => `<p class="center">${escapeHtml(m)}</p>`).join('')}
      ${autoClose ? `<p class="center" id="hint">${escapeHtml(T.closing)}</p>` : ''}
      <div class="center actions">
        ${link ? `<a class="btn" href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>` : ''}
        <a class="btn ghost" href="${escapeHtml(next || '/')}">${escapeHtml(T.continue)}</a>
      </div>
    </div>
  </main>
  <script>
    (function () {
      var data = ${safeJson(payload)};
      var next = ${safeJson(next || null)};
      try { new BroadcastChannel(data.type).postMessage(data); } catch (e) {}
      try { if (window.opener) window.opener.postMessage(data, location.origin); } catch (e) {}
      if (!${autoClose}) return;
      setTimeout(function () {
        if (window.opener) {
          window.close();
          setTimeout(function () { document.getElementById('hint').textContent = ${safeJson(T.canClose)}; }, 300);
        } else if (next && data.ok) {
          location.href = next;
        }
      }, ${ok ? 1400 : 4000});
    })();
  </script>
</body>
</html>`);
};
