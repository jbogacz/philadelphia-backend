import { ObjectId, type Collection } from 'mongodb';
import assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/campaign/campaign.repository';
import { Campaign, CampaignStatus } from '../../../src/features/campaign/campaign.types';
import { build, clearDatabase } from '../../helper';

test('campaign:repository', async t => {
  const fastify = await build(t);
  const collection: Collection = fastify.mongo.db.collection('campaigns');
  const campaignRepository: CampaignRepository = fastify.repository.campaign;

  t.before(async () => {
    await clearDatabase(fastify);
  });

  t.after(async () => {
    await fastify.close();
  });

  await t.test('should create new campaign', async () => {
    // given
    const campaign: Campaign = {
      campaignId: 'campaign-1',
      advertiserId: 'advertiser-1',
      landingPage: 'https://quip.com/',
      status: CampaignStatus.ACTIVE,
      traces: [],
    };

    // when
    var saved: Campaign = await campaignRepository.save(campaign);

    // then
    assert.ok(saved._id);
    assert.ok(await collection.findOne({ _id: new ObjectId(saved._id) }));
  });
});
