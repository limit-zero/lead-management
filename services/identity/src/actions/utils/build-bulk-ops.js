const mongodb = require('../../mongodb');

const SUBSCRIBER_NAMESPACE = 'FuelSOAP:Subscriber';

const attrMap = {
  'First Name': 'givenName',
  'Last Name': 'familyName',
  Title: 'title',
  'Company Name': 'companyName',
  Address: 'street',
  City: 'city',
  State: 'region',
  Zip: 'postalCode',
  Country: 'country',
  'Phone Number': 'phoneNumber',
  Industry: 'attributes.Industry',
  'Job Function': 'attributes.Job Function',
  'NAICS Code': 'attributes.NAICS Code',
};

const getDomainName = (email) => {
  const parts = email.split('@');
  return parts[1].trim();
};

const calcFieldCount = (attributes) => {
  let count = 0;
  const keys = ['givenName', 'familyName', 'title', 'companyName', 'emailAddress', 'phoneNumber', 'street', 'city', 'region', 'postalCode', 'country'];
  keys.forEach((key) => {
    if (attributes[key]) count += 1;
    // count all sub-attributes
    if (/^attributes\./.test(key)) count += 1;
  });
  return count;
};

const getExcludedDomainsFor = async (domains) => {
  const coll = await mongodb.collection('leads-graph', 'excluded-email-domains');
  const docs = await coll.find({
    domain: { $in: domains },
  }, { projection: { domain: 1 } }).toArray();
  return docs.map((doc) => doc.domain);
};

module.exports = async ({ nodes }) => {
  const domains = nodes.map((node) => getDomainName(node.emailAddress));
  const excludedDomains = await getExcludedDomainsFor(domains);

  return nodes.map((node) => {
    const { id, emailAddress } = node;
    const now = new Date();

    const criteria = {
      'externalSource.namespace': SUBSCRIBER_NAMESPACE,
      'externalSource.identifier': String(id),
    };

    const $setOnInsert = {
      ...criteria,
      'externalSource.createdAt': new Date(node.createdDate),
      createdAt: now,
    };

    const $set = node.attributes.reduce((o, attr) => {
      const ourKey = attrMap[attr.name];
      if (!ourKey) return o;
      const value = (attr.value || '').trim();
      return { ...o, [ourKey]: value };
    }, {
      emailAddress: emailAddress.trim().toLowerCase(),
      domain: getDomainName(emailAddress),
      'externalSource.lastRetrievedAt': now,
      updatedAt: now,
    });

    $set.fieldCount = calcFieldCount($set);
    $set.domainExcluded = excludedDomains.includes($set.domain);

    return {
      updateOne: {
        filter: criteria,
        update: { $setOnInsert, $set },
        upsert: true,
      },
    };
  });
};
