import { ObjectId, type Collection } from 'mongodb';
import assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/campaign/campaign.repository';
import {
  Campaign,
  CampaignStatus,
  CampaignTrace,
} from '../../../src/features/campaign/campaign.types';
import { build, clearDatabase } from '../../helper';

const randomCampaign = (): Campaign => ({
  campaignId: 'campaign-' + Math.random(),
  advertiserId: 'advertiser-' + Math.random(),
  landingPage: 'https://quip.com/',
  status: CampaignStatus.ACTIVE,
  traces: [],
});

const randomTrace = (): CampaignTrace => ({
  traceId: 'trace-' + Math.random(),
  publisherId: 'publisher-' + Math.random(),
  fingerprint: { fingerprintId: 'fingerprint-' + Math.random() },
  created: new Date(),
});

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
    const campaign: Campaign = randomCampaign();

    // when
    var saved: Campaign | null = await campaignRepository.save(campaign);

    // then
    assert.ok(saved?._id);
    assert.ok(await collection.findOne({ _id: new ObjectId(saved._id) }));
  });

  await t.test('should append trace to campaign with campaignId', async () => {
    // given
    const campaign: Campaign = randomCampaign();
    await campaignRepository.save(campaign);

    // when
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());

    // then
    const saved = await collection.findOne({ campaignId: campaign.campaignId });
    assert.ok(saved);
    assert.ok(saved.traces.length === 2);
  });

  await t.test('should return campaign with top 3 traces', async () => {
    // given
    const campaign: Campaign = randomCampaign();
    await campaignRepository.save(campaign);

    // when
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());

    // then
    const saved = await campaignRepository.findByCampaignId(campaign.campaignId, 3);
    assert.ok(saved);
    assert.ok(saved.traces.length === 3);
  });

  await t.test('should return campaign with all traces', async () => {
    // given
    const campaign: Campaign = randomCampaign();
    await campaignRepository.save(campaign);

    // when
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());
    await campaignRepository.appendTrace(campaign.campaignId, randomTrace());

    // then
    const saved = await campaignRepository.findByCampaignId(campaign.campaignId);
    assert.ok(saved);
    assert.ok(saved.traces.length === 4);
  });
});
