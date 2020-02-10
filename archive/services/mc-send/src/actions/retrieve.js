const { createError } = require('micro');
const { createParamError } = require('@limit-zero/lm-micro-service');

const { isArray } = Array;

module.exports = async ({ by, value, props }, { mc }) => {
  const supported = ['ID'];
  if (!supported.includes(by)) throw createParamError('params.by', by, supported);
  try {
    const send = await mc.retrieveOne('Send', {
      attributes: { 'xsi:type': 'SimpleFilterPart' },
      Property: by,
      SimpleOperator: 'equals',
      Value: value,
    }, isArray(props) ? props : undefined);
    if (!send) throw createError(404, `No Send found for ${by} ${value}`);
    if (send) delete send.attributes;
    return send;
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
