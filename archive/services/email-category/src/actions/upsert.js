const { createError } = require('micro');
const call = require('@limit-zero/lm-micro-client');
const moment = require('moment');

const capitalize = text => text.split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

/**
 * Indexes needed:
 * - `{ "external.ns": 1, "external.id": 1 }, { unique: true }`
 * - `{ "external.parentId": 1 }`
 * - `{ "hasDeployments": 1 }`
 *
 * Notes:
 * - The external identifier value is now a `Number` _not_ a `String`.
 * - The external namespace is now prefix with `MC:` instead of `FuelSOAP:`.
 * - The `externalSource` key has been renamed to `external`.
 * - The `externalSource.namespace` key has been renamed to `ns`.
 * - The `externalSource.identifier` key has been renamed to `id`.
 */
module.exports = async ({ id, hasDeployments }, { mongodb }) => {
  if (!id) throw createError(400, "No 'id' value was provided.");

  const params = {
    by: 'ID',
    value: id,
    props: ['ID', 'Name', 'CreatedDate', 'ModifiedDate'],
  };

  // @todo Need to determine how to select the db for different tenants (IEN vs. DDT)???
  const [collection, folders] = await Promise.all([
    mongodb.collection('lead-management', 'email-categories'),
    call('mc-data-folder.retrieve-tree', { params }),
  ]);

  const bulkOps = folders.map((folder, index) => {
    const {
      ID,
      Name,
      CreatedDate,
      ModifiedDate,
      ParentFolder,
    } = folder;

    const filter = {
      'external.id': Number(ID),
      'external.ns': 'MC:DataFolder',
    };

    const createdAt = moment(CreatedDate).toDate();
    const now = new Date();

    const names = [capitalize(Name)]
      .concat(folders.slice(index + 1).map(v => capitalize(v.Name)).filter(v => v))
      .reverse();

    const update = {
      $setOnInsert: {
        'external.createdAt': createdAt,
        'external.parentId': Number(ParentFolder.ID),
        createdAt: now,
        __v: 0,
        ...filter,
      },
      $set: {
        name: capitalize(Name),
        fullName: names.join(' | '),
        hasDeployments: hasDeployments ? true : false, // eslint-disable-line no-unneeded-ternary
        updatedAt: now,
        'external.updatedAt': ModifiedDate ? moment(ModifiedDate).toDate() : createdAt,
        'external.lastRetrievedAt': now,
      },
    };
    return { updateOne: { filter, update, upsert: true } };
  });

  const r = await collection.bulkWrite(bulkOps);
  return r;
};
