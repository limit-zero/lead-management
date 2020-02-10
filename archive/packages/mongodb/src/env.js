const {
  cleanEnv,
  custom,
} = require('@limit-zero/lm-env');

const { mongodsn } = custom;

module.exports = cleanEnv(process.env, {
  MONGO_URI: mongodsn({ desc: 'The MongoDB URI to connect to.' }),
});
