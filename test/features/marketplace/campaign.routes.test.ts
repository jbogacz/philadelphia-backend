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

  let testCampaign: Campaign;

  t.before(async () => {
    await clearDatabase(fastify);

    // Create a test campaign
    testCampaign = await campaignRepository.createV2({
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 1000,
      price: 10,
      duration: 30,
      trafficSources: 'source1',
      title: 'Test Campaign',
      providerId: 'provider_user',
      seekerId: 'seeker_user',
      utmCampaign: 'test-campaign-1',
      trackingUrl: 'http://backend.com/api/flows?utm_campaign=test-campaign-1',
      status: CampaignStatus.PENDING,
    });
  });

  await t.test('should query by provider or seeker', async () => {
    // given
    const campaign2: Campaign = {
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 2000,
      price: 20,
      duration: 14,
      trafficSources: 'source2',
      title: 'Campaign 2',
      providerId: 'seeker_user',
      seekerId: 'provider_user',
      utmCampaign: 'test-campaign-2',
      trackingUrl: 'http://backend.com/api/flows?utm_campaign=test-campaign-2',
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

  await t.test('should query campaigns by provider ID', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/campaigns?providerId=' + 'provider_user',
      headers: {
        'x-user-id': 'provider_user',
      },
    });

    assert.equal(response.statusCode, 200);
    const campaigns = response.json();
    assert.ok(Array.isArray(campaigns));
    assert.equal(campaigns.length, 1);
    assert.equal(campaigns[0].providerId, 'provider_user');
  });

  await t.test('should find campaign by ID', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${testCampaign._id}`,
      headers: {
        'x-user-id': 'provider_user',
      },
    });

    assert.equal(response.statusCode, 200);
    const campaign = response.json();
    assert.equal(campaign._id.toString(), testCampaign._id?.toString());
    assert.equal(campaign.title, testCampaign.title);
  });

  await t.test('should return 404 for non-existent campaign', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${new ObjectId()}`,
      headers: {
        'x-user-id': 'provider_user',
      },
    });

    assert.equal(response.statusCode, 404);
  });

  await t.test('should allow update campaign status to seeker', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/campaigns/${testCampaign._id}`,
      headers: {
        'x-user-id': 'seeker_user',
      },
      payload: {
        status: CampaignStatus.ACTIVE,
      },
    });

    assert.equal(response.statusCode, 200);
    const updatedCampaign = response.json();
    assert.equal(updatedCampaign.status, CampaignStatus.ACTIVE);
  });

  await t.test('should not allow update campaign status to provider', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/campaigns/${testCampaign._id}`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        status: CampaignStatus.PAUSED,
      },
    });

    assert.equal(response.statusCode, 403);
  });

  await t.test('should return 401 when user is not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/campaigns',
    });

    assert.equal(response.statusCode, 401);
  });

  await t.test('should return 403 when user is not campaign owner (seeker or provider)', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${testCampaign._id}`,
      headers: {
        'x-user-id': 'unauthorized_user',
      },
    });

    assert.equal(response.statusCode, 403);
  });
});
