const MarkingCloudSOAP = require('marketing-cloud-soap');
const {
  MC_CLIENT_ID: clientId,
  MC_CLIENT_SECRET: clientSecret,
  MC_WSDL: wsdl,
} = require('./env');

module.exports = new MarkingCloudSOAP({
  wsdl,
  auth: { clientId, clientSecret },
});
