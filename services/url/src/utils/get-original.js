const { ObjectID } = require('mongodb');
const mongodb = require('../mongodb');
const loadHref = require('./load-href');
const extractUrlId = require('./extract-url-id');

module.exports = async (href) => {
  const urlId = extractUrlId(href);
  if (!urlId) return href;

  // @todo Need to determine how to set tenant: IEN vs. DDT.
  const collection = await mongodb.db('leads-graph').collection('extracted-urls');

  // Attempt to find the extracted URL.
  const extractedUrl = await collection.findOne({
    _id: new ObjectID(urlId),
    'values.original': { $exists: true },
  }, { projection: { 'values.original': 1 } });

  // None found, treat as an empty URL
  if (!extractedUrl) return '';
  const { original } = extractedUrl.values;
  return loadHref(original);
};
