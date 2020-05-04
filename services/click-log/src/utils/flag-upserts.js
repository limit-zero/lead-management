const log = require('@lead-management/task-runner/log');
const clients = require('@lead-management/clients');

module.exports = async ({ rows }) => {
  log('Flagging subscribers and sends for upsert...');
  const subscriberIds = new Set();
  const sendIds = new Set();
  rows.forEach((row) => {
    subscriberIds.add(row.subscriberId);
    sendIds.add(row.sendId);
  });
  await clients.queue.request('bulkAdd', {
    items: [
      ...[...sendIds].map((id) => ({ namespace: 'Send', identifier: id })),
      ...[...subscriberIds].map((id) => ({ namespace: 'Subscriber', identifier: id })),
    ],
  });
  log(`${subscriberIds.size} subscriber(s) and ${sendIds.size} send(s) flagged.`);
};
