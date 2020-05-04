const { analytics } = require('../../brightcove');

module.exports = {
  getData: (params) => analytics.getData(params),
  getVideoData: (params) => analytics.getVideoData(params),
};
