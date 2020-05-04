const { checkRequired } = require('@lead-management/micro/utils');
const handleUpsert = require('./utils/handle-upsert');

module.exports = async ({ subscriberId }) => {
  checkRequired('subscriberId', subscriberId);
  return handleUpsert({ subscriberIds: [subscriberId] });
};
