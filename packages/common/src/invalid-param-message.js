module.exports = (param, value, supported) => `The value '${value}' for '${param}' is invalid. Valid values are '${supported.join("', '")}'`;
