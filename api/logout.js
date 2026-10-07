const { clearCookie } = require('./_lib/session');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', clearCookie('session'));
  res.redirect(302, '/');
};
