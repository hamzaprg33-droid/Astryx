const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = (res, { ok, message, status = 200 }) => {
  const payload = JSON.stringify({ type: 'astryx-auth', ok, message });
  res.status(status);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${ok ? 'Verifiziert' : 'Fehler'} – Astryx</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <h2 class="page-title">${ok ? 'Verifiziert' : 'Fehler'}</h2>
    <div class="panel">
      <p class="center">${escapeHtml(message)}</p>
      <p class="center" id="hint">Dieser Tab wird automatisch geschlossen …</p>
      <div class="center"><a class="btn" href="/">Zur Startseite</a></div>
    </div>
  </main>
  <script>
    (function () {
      var data = ${payload};
      try { new BroadcastChannel('astryx-auth').postMessage(data); } catch (e) {}
      try { if (window.opener) window.opener.postMessage(data, location.origin); } catch (e) {}
      setTimeout(function () {
        window.close();
        setTimeout(function () {
          document.getElementById('hint').textContent = 'Du kannst diesen Tab jetzt schließen.';
        }, 300);
      }, ${ok ? 1200 : 4000});
    })();
  </script>
</body>
</html>`);
};
