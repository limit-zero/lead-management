const mongodb = require('../mongodb');

module.exports = () => mongodb.collection('leads-graph', 'mc-click-log');
