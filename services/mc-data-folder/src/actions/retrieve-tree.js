const retrieve = require('./retrieve');

const { isArray } = Array;

const retrieveTree = async ({ by, value, props }, { mc }, tree = []) => {
  const result = await retrieve({ by, value, props }, { mc });
  tree.push(result);
  if (result.ParentFolder && result.ParentFolder.ID && result.ParentFolder.ID !== '0') {
    await retrieveTree({
      by,
      value: result.ParentFolder[by],
      props,
    }, { mc }, tree);
  }
  return tree.slice();
};

module.exports = async ({ by, value, props }, { mc }) => {
  const p = isArray(props) ? props : [];
  p.push(`ParentFolder.${by}`);

  try {
    const tree = await retrieveTree({ by, value, props: p }, { mc });
    return tree;
  } catch (e) {
    if (/^The Request Property/.test(e.message)) {
      // Send a 400 on bad props.
      e.statusCode = 400;
    }
    throw e;
  }
};
