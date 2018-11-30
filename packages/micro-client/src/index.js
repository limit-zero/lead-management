const fetch = require('node-fetch');
const { createError } = require('micro');

module.exports = async (resource, {
  params = {},
  meta = {},
  fetchOptions = {},
} = {}) => {
  const [service, action] = resource.split('.');
  if (!service) throw createError(400, 'No service name was provided to call method.');
  const url = `http://${service}`; // @todo Assumes docker. Is there a better way to handle?
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params, meta }),
    ...fetchOptions,
  });
  const json = await res.json();
  if (!res.ok) {
    throw createError(res.status, `Error from '${service}' service: ${json.message}`);
  }
  return json;
};
