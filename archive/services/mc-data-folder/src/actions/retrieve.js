const { createError } = require('micro');
const { createParamError } = require('@limit-zero/lm-micro-service');

const { isArray } = Array;

module.exports = async ({ by, value, props }, { mc }) => {
  const supported = ['ID', 'ObjectID', 'Name'];
  if (!supported.includes(by)) throw createParamError('params.by', by, supported);
  try {
    const folder = await mc.retrieveOne('DataFolder', {
      attributes: { 'xsi:type': 'SimpleFilterPart' },
      Property: by,
      SimpleOperator: 'equals',
      Value: value,
    }, isArray(props) ? props : undefined);
    if (!folder) throw createError(404, `No DataFolder found for ${by} ${value}`);
    if (folder) delete folder.attributes;
    return folder;
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
