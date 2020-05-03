module.exports = (message) => {
  const { log: emit } = console;
  emit(`> ${message}`);
};
