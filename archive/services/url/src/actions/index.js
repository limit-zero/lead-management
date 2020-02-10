const clean = require('./clean');
const crawl = require('./crawl');
const extractFromHtml = require('./extract-from-html');
const hash = require('./hash');
const mapFromHtml = require('./map-from-html');

module.exports = {
  clean,
  crawl,
  'extract-from-html': extractFromHtml,
  hash,
  'map-from-html': mapFromHtml,
};
