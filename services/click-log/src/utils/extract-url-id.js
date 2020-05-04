const mongodb = require('../mongodb');

const { ObjectId } = mongodb;

const pattern1 = /leads\.limit0\.io\/click\/([a-f0-9]{24})/;
const pattern2 = /lt\.lid=([a-f0-9]{24})/;

module.exports = (value) => {
  const legacyMatches = pattern1.exec(value);
  if (legacyMatches && legacyMatches[1]) return ObjectId(legacyMatches[1]);
  const matches = pattern2.exec(value);
  if (matches && matches[1]) return ObjectId(matches[1]);
  return null;
};
