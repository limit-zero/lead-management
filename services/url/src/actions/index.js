const clean = require('./clean');
const crawl = require('./crawl');
const extractFromHtml = require('./extract-from-html');
const mapFromHtml = require('./map-from-html');

module.exports = {
  clean,
  crawl,
  'extract-from-html': extractFromHtml,
  'map-from-html': mapFromHtml,
};
