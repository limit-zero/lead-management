const { createError } = require('micro');
const call = require('@limit-zero/lm-micro-client');

/**
 * Indexes needed:
 * - `{ "external.ns": 1, "external.id": 1 }, { unique: true }`
 * - `{ "external.categoryId": 1 }`
 *
 * Notes:
 * - The external identifier value is now a `Number` _not_ a `String`.
 * - The external namespace is now prefix with `MC:` instead of `FuelSOAP:`.
 * - The `externalSource` key has been renamed to `external`.
 * - The `externalSource.namespace` key has been renamed to `ns`.
 * - The `externalSource.identifier` key has been renamed to `id`.
 */
module.exports = async ({ id }, { mongodb }) => {
  if (!id) throw createError(400, "No 'id' value was provided.");

  const params = {
    by: 'ID',
    value: id,
    props: ['ID', 'Name', 'CategoryID', 'CreatedDate', 'ModifiedDate', 'Subject'],
  };

  // @todo Need to determine how to select the db for different tenants (IEN vs. DDT)???
  const [collection, email] = await Promise.all([
    mongodb.collection('lead-management', 'email-deployments'),
    call('mc-email.retrieve', { params }),
  ]);

  const {
    ID,
    Name,
    CategoryID,
    CreatedDate,
    ModifiedDate,
    Subject,
  } = email;

  // Upsert the category tree for this deployment.
  // Fire... do not await.
  call('email-category.upsert', { params: { id: CategoryID, hasDeployments: true } });

  const query = {
    'external.id': Number(ID),
    'external.ns': 'MC:Email',
  };

  const now = new Date();
  const update = {
    $setOnInsert: {
      rollupMetrics: false,
      createdAt: now,
      'external.createdAt': CreatedDate,
      __v: 0,
      ...query,
    },
    $set: {
      name: Name,
      subject: Subject,
      updatedAt: now,
      'external.categoryId': Number(CategoryID),
      'external.updatedAt': ModifiedDate,
      'external.lastRetrievedAt': now,
    },
  };

  const r = await collection.updateOne(query, update, { upsert: true });
  return r;
};
