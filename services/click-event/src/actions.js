const call = require('@limit-zero/lm-micro-client');

module.exports = {
  test: async () => {
    const params = {
      by: 'ID',
      value: '2300856',
      props: ['ID', 'EmailAddress'],
    };
    const json = await call('mc-subscriber.retrieve', { params });
    return { ID: json.data.ID };
  },
};
