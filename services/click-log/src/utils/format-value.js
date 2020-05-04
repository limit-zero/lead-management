module.exports = ({ fields, name, value }) => {
  const type = fields[name];
  // force an offset of six hours
  // marketing cloud ignores CDT and uses all dates in CST
  const tzOffset = 6 * 60 * 60 * 1000;

  switch (type) {
    case 'Boolean':
      if (value === 'False' || value === 'false' || value === '0') return false;
      if (value === 'True' || value === 'true') return true;
      return Boolean(value);
    case 'Number':
      return Number(value);
    case 'Date':
      return new Date(Date.parse(value) + tzOffset);
    default:
      if (value === 'False' || value === 'false') return false;
      if (value === 'True' || value === 'true') return true;
      return value;
  }
};
