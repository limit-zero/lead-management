const AWS = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = require('./env');

process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;

AWS.config.update({ region: AWS_REGION });

module.exports = new AWS.SQS();
