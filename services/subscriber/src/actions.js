const { createError } = require('micro');
const { invalidParamMsg } = require('@limit-zero/lm-common');

const { isArray } = Array;

module.exports = {
  retrieve: async ({ by, value, props }, { mc }) => {
    const supported = ['ID', 'SubscriberKey'];
    if (!supported.includes(by)) throw createError(400, invalidParamMsg('params.by', by, supported));
    try {
      const subscriber = await mc.retrieveOne('Subscriber', {
        attributes: { 'xsi:type': 'SimpleFilterPart' },
        Property: by,
        SimpleOperator: 'equals',
        Value: value,
      }, isArray(props) ? props : undefined);
      return { data: subscriber };
    } catch (e) {
      if (/^The Request Property/.test(e.message)) {
        // Send a 400 on bad props.
        e.statusCode = 400;
      }
      throw e;
    }
  },
};
