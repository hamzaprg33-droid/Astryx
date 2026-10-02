const { parseCookies } = require('./session');
const { MAIN_GUILD_ID } = require('./discord');

const MAIN_SERVER_URL = `https://discord.com/channels/${MAIN_GUILD_ID}`;

const STRINGS = {
  de: {
    verifiedTitle: 'Verifiziert',
    invitedTitle: 'Bot eingeladen',
    errorTitle: 'Fehler',
    verified: 'Du bist jetzt verifiziert.',
    joinedMain: 'Du wurdest außerdem dem Astryx-Server hinzugefügt.',
    joinFallback: 'Wir konnten dich nicht automatisch zum Astryx-Server hinzufügen. Nutze stattdessen diese einmalige Einladung:',
    joinButton: 'Astryx-Server beitreten',
    invited: 'Astryx wurde erfolgreich zu „{guild}“ hinzugefügt.',
    cancelled: 'Autorisierung abgebrochen.',
    invalid: 'Ungültige Anfrage. Bitte versuche es erneut.',
    failed: 'Verifizierung fehlgeschlagen. Bitte versuche es erneut.',
    forbidden: 'Du kannst diesen Server nur verwalten, wenn du Inhaber bist oder die Administrator-Berechtigung hast.',
    botMissing: 'Der Bot wurde auf dem Server nicht gefunden. Bitte versuche es erneut.',
    rateLimited: 'Discord ist gerade ausgelastet. Bitte versuche es gleich noch einmal.',
    closing: 'Dieser Tab wird automatisch geschlossen …',
    canClose: 'Du kannst diesen Tab jetzt schließen.',
    continue: 'Weiter',
    dmTitle: 'Hallo, ich bin Astryx!',
    dmBody: (guild, site) =>
      `Vielen lieben Dank, dass du dich für Astryx entschieden und mich auf **${guild}** eingeladen hast!\n\n` +
      'Wir hoffen, dass du dich schnell zurechtfindest und dass ich deinem Server eine echte Hilfe bin. Ich bin ab sofort einsatzbereit und warte nur darauf, von dir eingerichtet zu werden.\n\n' +
      `**Dashboard**\nAlle Einstellungen für deinen Server findest du ganz bequem in unserem Dashboard: ${site}\n\n` +
      `**Feedback und Ideen**\nWir entwickeln Astryx ständig weiter, und deine Meinung ist uns dabei sehr wichtig. Wenn du Feedback, Verbesserungsvorschläge oder einen Fehler gefunden hast, schreib uns gerne auf unserem [Discord-Server](${MAIN_SERVER_URL}).\n\n` +
      'Viel Spaß mit Astryx!',
  },
  en: {
    verifiedTitle: 'Verified',
    invitedTitle: 'Bot invited',
    errorTitle: 'Error',
    verified: 'You are now verified.',
    joinedMain: 'You have also been added to the Astryx server.',
    joinFallback: 'We could not add you to the Astryx server automatically. Use this one-time invite instead:',
    joinButton: 'Join Astryx server',
    invited: 'Astryx was successfully added to “{guild}”.',
    cancelled: 'Authorization cancelled.',
    invalid: 'Invalid request. Please try again.',
    failed: 'Verification failed. Please try again.',
    forbidden: 'You can only manage this server if you are the owner or have the Administrator permission.',
    botMissing: 'The bot was not found on the server. Please try again.',
    rateLimited: 'Discord is busy right now. Please try again in a moment.',
    closing: 'This tab will close automatically …',
    canClose: 'You can close this tab now.',
    continue: 'Continue',
    dmTitle: "Hi, I'm Astryx!",
    dmBody: (guild, site) =>
      `Thank you so much for choosing Astryx and inviting me to **${guild}**!\n\n` +
      "We hope you'll find your way around quickly and that I'll be a real help to your server. I'm ready to go and just waiting for you to set me up.\n\n" +
      `**Dashboard**\nYou can manage all settings for your server conveniently in our dashboard: ${site}\n\n` +
      `**Feedback & ideas**\nWe are constantly improving Astryx, and your opinion matters a lot to us. If you have feedback, suggestions or found a bug, feel free to write to us on our [Discord server](${MAIN_SERVER_URL}).\n\n` +
      'Have fun with Astryx!',
  },
};

const getLang = (req) => {
  const c = parseCookies(req).lang;
  if (c === 'de' || c === 'en') return c;
  return /^de\b/i.test(String(req.headers['accept-language'] || '').trim()) ? 'de' : 'en';
};

const strings = (lang) => STRINGS[lang] || STRINGS.en;

module.exports = { getLang, strings };
