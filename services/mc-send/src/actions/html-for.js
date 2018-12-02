const { createError } = require('micro');
const fetch = require('node-fetch');

module.exports = async ({ id }, { mc }) => {
  if (!id) throw createError(400, "No 'id' value was provided.");
  const props = ['ID', 'PreviewURL'];
  try {
    const send = await mc.retrieveOne('Send', {
      attributes: { 'xsi:type': 'SimpleFilterPart' },
      Property: 'ID',
      SimpleOperator: 'equals',
      Value: id,
    }, props);
    if (!send) throw createError(404, `No Send found for ID ${id}`);

    const { PreviewURL } = send;
    const res = await fetch(PreviewURL);
    const html = await res.text();
    return { html };
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
