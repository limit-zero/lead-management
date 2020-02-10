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
  return keys(attrMap).reduce(({ set, unset }, theirKey) => {
    const ourKey = attrMap[theirKey];
    const value = attrs[theirKey];
    if (value) return { set: { ...set, [ourKey]: value }, unset: { ...unset } };
    return { set: { ...set }, unset: { ...unset, [ourKey]: 1 } };
  }, { set: {}, unset: {} });
};
