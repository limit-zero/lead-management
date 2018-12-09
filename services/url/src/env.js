const {
  cleanEnv,
  custom,
} = require('@limit-zero/lm-env');

const { mongodsn, nonemptystr } = custom;

module.exports = cleanEnv(process.env, {
  URL_MONGO_URI: mongodsn({ desc: 'The MongoDB URI to connect to for Extracted URLs.' }),
  URL_HASH_PARAM: nonemptystr({ desc: 'The extracted URL hash parameter.' }),
});
