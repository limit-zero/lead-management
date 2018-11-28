const {
  cleanEnv,
  custom,
} = require('@limit-zero/lm-env');

const { nonemptystr } = custom;

module.exports = cleanEnv(process.env, {
  AWS_ACCESS_KEY_ID: nonemptystr(),
  AWS_SECRET_ACCESS_KEY: nonemptystr(),
  AWS_REGION: nonemptystr({ default: 'us-east-2' }),
});
