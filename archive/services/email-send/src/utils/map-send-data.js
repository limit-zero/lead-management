const { isObject } = require('@limit-zero/lm-common');
const attrMap = require('./attr-map');

const { keys } = Object;

/**
 * Maps ExactTarget subscriber data to Identity model data.
 *
 * @param {object} send
 */
module.exports = (send) => {
  if (!isObject(send)) return {};
  return keys(attrMap).reduce(({ set, unset }, theirKey) => {
    const ourKey = attrMap[theirKey];
    const value = send[theirKey];
    if (value) return { set: { ...set, [ourKey]: value }, unset: { ...unset } };
    return { set: { ...set }, unset: { ...unset, [ourKey]: 1 } };
  }, { set: {}, unset: {} });
};
