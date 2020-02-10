module.exports = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => parseInt(id, 10));
};
