/* eslint-disable no-console */
const { send } = require('micro');

const dev = process.env.NODE_ENV === 'development';

module.exports = fn => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (e) {
    const { message, stack } = e;
    const status = e.statusCode || e.status || 500;
    const obj = { error: true, status, message };
    if (dev && stack) obj.stack = stack.split('\n');
    send(res, status, obj);
    if (e instanceof Error) {
      console.error(`${status} ${stack}`);
    } else {
      console.error('Unknown Error instance.', e);
    }
    return null;
  }
};
