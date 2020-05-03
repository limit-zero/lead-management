const client = require('@lead-management/micro/json/client');
const env = require('./env');
const serviceList = require('./list');
const { envVar } = require('./utils');

module.exports = serviceList.reduce((o, name) => {
  const key = envVar(name);
  const url = env[key];
  return { ...o, [name]: client({ url }) };
}, {});
