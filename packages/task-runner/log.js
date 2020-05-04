module.exports = (message, { before = '' } = {}) => {
  const { log: emit } = console;
  emit(`${before || ''}> ${message}`);
};
