const {
  cleanEnv,
  validators,
} = require('@base-cms/env');

const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  MONGO_URI: nonemptystr({ desc: 'The Lead Management database to connect to.' }),
});
