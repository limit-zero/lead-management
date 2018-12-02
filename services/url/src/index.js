const { jsonService } = require('@limit-zero/lm-micro-service');
const actions = require('./actions');

module.exports = jsonService({ actions });
