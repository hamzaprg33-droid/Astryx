const crypto = require('crypto');

const sign = (v) => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(v).digest('base64url');

exports.createToken = (data) => {
  const body = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${body}.${sign(body)}`;
};

exports.readToken = (token) => {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
};

exports.parseCookies = (req) =>
  Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, v.join('=')])
  );
