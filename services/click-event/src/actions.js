const call = require('@limit-zero/lm-micro-client');

module.exports = {
  test: async () => {
    const [subscriber, send] = await Promise.all([
      call('mc-subscriber.retrieve', { params: { by: 'ID', value: 2300856, props: ['EmailAddress'] } }),
      call('mc-send.retrieve', { params: { by: 'ID', value: 287963, props: ['EmailName', 'SentDate'] } }),
    ]);

    // @todo Should all responses be prefixed with `data`?
    return { data: { subscriber, send } };
  },
};
