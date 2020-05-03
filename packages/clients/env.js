const {
  cleanEnv,
  str,
} = require('envalid');
const { envVar } = require('./utils');
const serviceList = require('./list');

module.exports = cleanEnv(process.env, serviceList.reduce((o, name) => {
  const validator = str({ desc: `The ${name} service URL.`, default: `http://${name}` });
  return { ...o, [envVar(name)]: validator };
}, {}));
