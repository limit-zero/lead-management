module.exports = (value) => {
  if (!value) return undefined;
  return `${value}`.replace(/[\r\n]/g, ' ').replace(/\s\s+/g, ' ');
};
