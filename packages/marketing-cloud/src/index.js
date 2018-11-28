const MarkingCloudSOAP = require('marketing-cloud-soap');
const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  WSDL: wsdl,
} = require('./env');

module.exports = new MarkingCloudSOAP({
  wsdl,
  auth: { clientId, clientSecret },
});
