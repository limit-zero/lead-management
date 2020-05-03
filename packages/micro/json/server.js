const micro = require('micro');
const { get, isFunction: isFn } = require('@lead-management/utils');
const errorHandler = require('./error-handler');

const { json, createError } = micro;

module.exports = ({
  name,
  actions = {},
  context,

  onError,
  errorResponseFn,
} = {}) => {
  if (!name) throw new Error('No service name was provided.');
  /**
   *
   */
  const actionHandler = async (req, res) => {
    const input = await json(req);
    const { action: path, params, meta } = input;
    if (!path) throw createError(400, 'No action provided.');

    const fn = get(actions, path);
    if (!isFn(fn)) throw createError(400, `No action found for ${path}`);

    const contextData = isFn(context) ? await context({ req, res, input }) : context;

    const data = await fn(params || {}, {
      req,
      res,
      meta: meta || {},
      context: contextData || {},
    });
    return { data };
  };

  /**
   * Returns the wrapped micro server.
   */
  return micro(errorHandler({
    name,
    fn: actionHandler,
    onError,
    createResponse: errorResponseFn,
  }));
};
