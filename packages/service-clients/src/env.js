const {
  cleanEnv,
  validators,
} = require('@base-cms/env');

const { nonemptystr } = validators;

const services = [
  'url',
];

module.exports = cleanEnv(process.env, services.reduce((o, name) => {
  const prop = `${name.toUpperCase()}_SERVICE_URL`;
  const validator = nonemptystr({ desc: `The lead management ${name} service URL to connect to.`, default: `http://${name}` });
  return { ...o, [prop]: validator };
}, {}));
