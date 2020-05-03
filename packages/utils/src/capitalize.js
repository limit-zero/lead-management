module.exports = (value) => {
  if (!value) return value;
  const str = `${value}`;
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};
