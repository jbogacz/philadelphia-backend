import { Db, ObjectId } from 'mongodb';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/marketplace/campaign.repository';
import { Campaign, CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { build, clearDatabase } from '../../helper';

test('campaign.routes', async (t) => {
  const fastify = await build(t);
  const db: Db = fastify.mongo.db;
  const campaignRepository: CampaignRepository = fastify.repository.campaign;

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should query by provider or requester', async () => {
    // given
    const campaign1: Campaign = {
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 1000,
      price: 10,
      duration: 30,
      trafficSources: 'source1',
      title: 'Campaign 1',
      providerId: 'provider_user',
      requesterId: 'requester_user',
      trackingUrl: 'http://example.com/tracking1',
      status: CampaignStatus.PENDING,
    };
    await campaignRepository.createV2(campaign1);

    const campaign2: Campaign = {
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 2000,
      price: 20,
      duration: 14,
      trafficSources: 'source2',
      title: 'Campaign 2',
      providerId: 'requester_user',
      requesterId: 'provider_user',
      trackingUrl: 'http://example.com/tracking2',
      status: CampaignStatus.PENDING,
    };
    await campaignRepository.createV2(campaign2);

    // when
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/campaigns',
      headers: {
        'x-user-id': 'provider_user',
      },
    });

    // then
    assert.equal(response.statusCode, 200);
    const campaigns = response.json();
    assert.ok(campaigns);
    assert.ok(campaigns.length === 2);
  });
});
