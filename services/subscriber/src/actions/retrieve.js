const { createError } = require('micro');
const { createParamError } = require('@limit-zero/lm-micro-service');

const { isArray } = Array;

module.exports = async ({ by, value, props }, { mc }) => {
  const supported = ['ID', 'SubscriberKey'];
  if (!supported.includes(by)) throw createParamError('params.by', by, supported);
  try {
    const subscriber = await mc.retrieveOne('Subscriber', {
      attributes: { 'xsi:type': 'SimpleFilterPart' },
      Property: by,
      SimpleOperator: 'equals',
      Value: value,
    }, isArray(props) ? props : undefined);
    if (!subscriber) throw createError(404, `No Subscriber found for ${by} ${value}`);
    if (subscriber) delete subscriber.attributes;
    return { data: subscriber };
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
