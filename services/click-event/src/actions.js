const fetch = require('node-fetch');

module.exports = {
  test: async () => {
    // @todo This should be abstracted.
    const res = await fetch('http://subscriber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        action: 'retrieve',
        params: {
          by: 'ID',
          value: '2300856',
          props: ['ID', 'EmailAddress'],
        },
      }),
    });
    // @todo Errors need to be JSON, otherwise this will fail.
    const json = await res.json();
    return { ID: json.data.ID };
  },
};
