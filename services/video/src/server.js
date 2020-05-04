const micro = require('@lead-management/micro/json/server');
const actions = require('./actions');
const newrelic = require('./newrelic');
const { name } = require('../package.json');

module.exports = micro({
  name,
  actions,
  context: ({ input }) => {
    const { action } = input;
    newrelic.setTransactionName(action);
    return {};
  },
});
