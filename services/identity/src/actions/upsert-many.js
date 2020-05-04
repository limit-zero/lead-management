const { checkArray, createError } = require('@lead-management/micro/utils');
const handleUpsert = require('./utils/handle-upsert');

module.exports = async ({ subscriberIds = [] }) => {
  checkArray('subscriberIds', subscriberIds);
  if (!subscriberIds.length) throw createError(400, 'The subscriberIds must be provided.');
  return handleUpsert({ subscriberIds });
};
