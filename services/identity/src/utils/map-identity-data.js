const { isObject } = require('@limit-zero/lm-common');
const flattenAttrs = require('./flatten-attrs');
const attrMap = require('./attr-map');

const { keys } = Object;

/**
 * Maps ExactTarget subscriber data to Identity model data.
 *
 * @param {object} subscriber
 */
module.exports = (subscriber) => {
  if (!isObject(subscriber)) return {};
  const attrs = flattenAttrs(subscriber.Attributes);
  return keys(attrMap).reduce((o, theirKey) => {
    const ourKey = attrMap[theirKey];
    const value = attrs[theirKey];
    if (value) return { ...o, [ourKey]: value };
    return o;
  }, {});
};
