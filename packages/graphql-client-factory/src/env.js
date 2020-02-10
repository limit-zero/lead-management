const {
  cleanEnv,
  validators,
} = require('@base-cms/env');

const { nonemptystr } = validators;

module.exports = cleanEnv(process.env, {
  MC_GRAPHQL_URI: nonemptystr({ desc: 'The primary Marketing Cloud GraphQL API to connect to.' }),
});
