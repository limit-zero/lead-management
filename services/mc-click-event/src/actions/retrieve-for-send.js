const { createError } = require('micro');

module.exports = async ({ sendId, props }, { mc }) => {
  if (!sendId) throw createError(400, "No 'sendId' was provided.");
  try {
    const Filter = {
      attributes: { 'xsi:type': 'SimpleFilterPart' },
      Property: 'SendID',
      SimpleOperator: 'equals',
      Value: sendId,
    };
    const { Results } = await mc.retrieve('ClickEvent', props, { Filter });
    return Results;
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
