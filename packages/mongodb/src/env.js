const {
  cleanEnv,
  str,
} = require('envalid');


module.exports = cleanEnv(process.env, {
  MONGO_URI: str({ desc: 'The Lead Management database to connect to.' }),
});
