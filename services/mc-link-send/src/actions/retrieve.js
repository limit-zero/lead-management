const { createError } = require('micro');
const { createParamError } = require('@limit-zero/lm-micro-service');

const { isArray } = Array;

module.exports = async ({ by, value, props }, { mc }) => {
  const supported = ['ID'];
  if (!supported.includes(by)) throw createParamError('params.by', by, supported);
  try {
    const linkSend = await mc.retrieveOne('LinkSend', {
      attributes: { 'xsi:type': 'SimpleFilterPart' },
      Property: by,
      SimpleOperator: 'equals',
      Value: value,
    }, isArray(props) ? props : undefined);
    if (!linkSend) throw createError(404, `No Email found for ${by} ${value}`);
    return linkSend;
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
