const getCollection = require('./get-collection');

module.exports = async () => {
  const defaultDate = new Date(Date.parse('2020-05-01T00:00:00-0600'));
  const coll = await getCollection();
  const lastDoc = await coll.findOne({}, { sort: { date: -1 }, projection: { date: 1 } });
  const since = lastDoc ? lastDoc.date : defaultDate;
  return since;
};
