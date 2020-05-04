const { get } = require('@lead-management/utils');
const log = require('@lead-management/task-runner/log');
const { cms } = require('../../brightcove');
const mongodb = require('../../mongodb');

/**
 * Note: this will only set created videos, not update older videos that have changed.
 */
module.exports = async () => {
  log('Syncing brightcove videos...');
  const coll = await mongodb.collection('leads-graph', 'videos');
  const lastVideo = await coll.findOne({}, { sort: { 'externalSource.createdAt': -1 } });
  const lastCreated = get(lastVideo, 'externalSource.createdAt');
  log(`Last video created date: ${lastCreated}`);

  const q = lastCreated ? `created_at:${lastCreated.toISOString()}` : undefined;

  const { count } = await cms.getVideoCount({ sort: 'created_at', q });
  const limit = 100;
  const numberOfPages = Math.ceil(count / limit);
  log(`Found ${count} videos to sync, accounting for ${numberOfPages} pages.`);

  for (let n = 0; n < numberOfPages; n += 1) {
    log(`Syncing page ${n + 1} of ${numberOfPages}...`);
    const offset = n * limit;
    // eslint-disable-next-line no-await-in-loop
    const videos = await cms.getVideos({
      limit,
      offset,
      sort: 'created_at',
      q,
    });
    log(`Found ${videos.length} videos.`);
    const bulkOps = videos.map((video) => {
      const criteria = {
        'externalSource.namespace': 'Brightcove:Video',
        'externalSource.identifier': `${video.id}`,
      };

      const $setOnInsert = {
        ...criteria,
        'externalSource.createdAt': new Date(Date.parse(video.created_at)),
      };

      const publishedAt = video.published_at ? new Date(Date.parse(video.published_at)) : null;
      const thumbnail = get(video, 'images.thumbnail.src');
      const image = get(video, 'images.poster.src');

      const $set = {
        'externalSource.lastRetrievedAt': new Date(),
        'externalSource.updatedAt': new Date(Date.parse(video.updated_at)),
        name: video.name,
        ...(video.description && { description: video.description }),
        ...(video.long_description && { body: video.long_description }),
        duration: video.duration,
        originalFilename: video.original_filename,
        ...(publishedAt && { publishedAt }),
        ...(image && { image }),
        ...(thumbnail && { thumbnail }),
        ...(video.state && { state: video.state }),
        ...(video.tags && { tags: video.tags }),
      };

      return {
        updateOne: {
          filter: criteria,
          update: { $set, $setOnInsert },
          upsert: true,
        },
      };
    });
    if (bulkOps.length) {
      // eslint-disable-next-line no-await-in-loop
      await coll.bulkWrite(bulkOps);
    }
    log('Videos upserted.');
  }
};
