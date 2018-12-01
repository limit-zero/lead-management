const { isArray } = Array;

/**
 * Flattens ExactTarget subscriber array attributes into a single key/value object.
 *
 * @param {array} attributes
 */
module.exports = (attributes) => {
  const attrs = attributes && isArray(attributes) ? attributes : [];
  return attrs.reduce((obj, { Name, Value }) => ({ ...obj, [Name]: Value }), {});
};
