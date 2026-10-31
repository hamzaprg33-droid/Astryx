// Platzhalter für Nachrichten – EINE Stelle für alle Module (Willkommer, später z. B. Abschied, Logs …).
// Die Regeln müssen mit bot/lib/placeholders.js übereinstimmen.
//
//   @user            Erwähnung (pingt in normalem Text)       z. B. @Astryx Bot
//   <user_name>      Anzeigename                              z. B. Astryx Bot
//   <user_username>  Benutzername (mit #Tag, falls vorhanden) z. B. Astryx Bot#3513
//   <user_id>        Discord-ID                               z. B. 1555467302282207272
//   {server}         Servername
//   {members}        Mitgliederzahl
//
// Moderation (Vorschau):
//   @teamuser, <teamuser_name>, <teamuser_username>, <teamuser_id>
//   <warn_number>, <expire>
window.PLACEHOLDERS = (() => {
  // Alte Schreibweisen ({user}, {username}, @neuer_user, @new_user) werden nur noch erkannt,
  // damit bereits gespeicherte Nachrichten nicht kaputtgehen.
  const RE = /<user_username>|<user_name>|<user_id>|@user(?!\w)|\{user\}|\{username\}|@neuer_user|@new_user|\{server\}|\{members\}|@teamuser(?!\w)|<teamuser_username>|<teamuser_name>|<teamuser_id>|<warn_number>|<expire>/gi;
  const MENTION = '\uE000';   // Platzhalter-Zeichen für die Erwähnung (wird in der Vorschau als Erwähnung gezeichnet)
  const TEAM_MENTION = '\uE001';

  const sample = { username: 'Astryx Bot#3513', name: 'Astryx Bot', id: '1555467302282207272' };
  const team = { username: 'Moderator#1234', name: 'Moderator', id: '123456789012345678' };

  // Ein Durchgang über den Text: eingesetzte Werte werden nicht erneut ersetzt
  const replace = (text, ctx) => String(text).replace(RE, (m, off, str) => {
    switch (m.toLowerCase()) {
      case '<user_username>': return sample.username;
      case '<user_name>': return sample.name;
      case '<user_id>': return sample.id;
      case '@user': return off > 0 && /[\w@]/.test(str[off - 1]) ? m : MENTION;   // "mail@user.com" bleibt Text
      case '{user}': case '@neuer_user': case '@new_user': return MENTION;
      case '{username}': return sample.username;
      case '{server}': return ctx.server;
      case '{members}': return String(ctx.members);
      case '@teamuser': return (off > 0 && /[\w@]/.test(str[off - 1])) ? m : TEAM_MENTION;
      case '<teamuser_username>': return team.username;
      case '<teamuser_name>': return team.name;
      case '<teamuser_id>': return team.id;
      case '<warn_number>': return '1';
      case '<expire>': return 'permanent';
    }
    return m;
  });

  // Für die Vorschau: Text mit Platzhaltern -> Inhalt, Erwähnungen farbig
  const preview = (text, ctx) => {
    const frag = document.createDocumentFragment();
    const rendered = replace(text, ctx);
    // Split on both mention markers
    const parts = rendered.split(new RegExp(`(${MENTION}|${TEAM_MENTION})`, 'g'));
    for (const part of parts) {
      if (part === MENTION) {
        const sp = document.createElement('span');
        sp.className = 'mention';
        sp.textContent = '@' + sample.name;
        frag.append(sp);
      } else if (part === TEAM_MENTION) {
        const sp = document.createElement('span');
        sp.className = 'mention';
        sp.textContent = '@' + team.name;
        frag.append(sp);
      } else if (part) {
        frag.append(part);
      }
    }
    return frag;
  };

  // Alte Schreibweise in die neue umwandeln (beim Laden gespeicherter Einstellungen)
  const migrate = (text) => String(text)
    .replace(/\{user\}|@neuer_user|@new_user/gi, '@user')
    .replace(/\{username\}/gi, '<user_username>');

  return { preview, migrate, sample, replace, MENTION };
})();
