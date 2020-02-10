const cheerio = require('cheerio');

module.exports = (href) => {
  const $ = cheerio.load(`<a href="${href}"></a>`);
  return $('a').attr('href');
};
