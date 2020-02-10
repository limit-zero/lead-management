const {
  cleanEnv,
  custom,
} = require('@limit-zero/lm-env');

const { nonemptystr } = custom;

module.exports = cleanEnv(process.env, {
  MC_WSDL: nonemptystr({ desc: 'The Marketing Cloud API WSDL to use.', default: 'https://webservice.s7.exacttarget.com/etframework.wsdl' }),
  MC_CLIENT_ID: nonemptystr({ desc: 'The Marketing Cloud API Client ID.' }),
  MC_CLIENT_SECRET: nonemptystr({ desc: 'The Marketing Cloud API Client Secret.' }),
});
