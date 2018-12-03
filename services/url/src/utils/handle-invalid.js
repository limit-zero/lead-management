const { createError } = require('micro');

module.exports = (url, onInvalid) => {
  switch (onInvalid) {
    case 'return':
      return { url };
    case 'empty':
      return { url: '' };
    default:
      throw createError(400, `The URL '${url}' is invalid.`);
  }
};
