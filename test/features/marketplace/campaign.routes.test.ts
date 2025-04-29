import { addDays } from 'date-fns/addDays';
import { startOfDay } from 'date-fns/startOfDay';
import { ObjectId } from 'mongodb';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/marketplace/campaign.repository';
import { Campaign, CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { UserRepository } from '../../../src/features/user/user.repository';
import { UserRole } from '../../../src/features/user/user.types';
import { build, clearDatabase } from '../../helper';

test('campaign.routes', async (t) => {
  const fastify = await build(t);
  const campaignRepository: CampaignRepository = fastify.repository.campaign;
  const userRepository: UserRepository = fastify.repository.user;

  let testCampaign1: Campaign;
  let testCampaign2: Campaign;

  t.before(async () => {
    await clearDatabase(fastify);

    await userRepository.createV2({
      userId: 'provider_user',
      email: 'provider@test.pl',
      role: UserRole.USER,
    });

    await userRepository.createV2({
      userId: 'seeker_user',
      email: 'seeker@test.pl',
      role: UserRole.USER,
    });

    await userRepository.createV2({
      userId: 'other_user',
      email: 'other_user@test.pl',
      role: UserRole.USER,
    });

    // Create a test campaign
    testCampaign1 = await campaignRepository.createV2({
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 1000,
      price: 10,
      duration: 30,
      trafficSources: 'source1',
      title: 'Test Campaign',
      destinationUrl: 'http://example.com/landing-page',
      providerId: 'provider_user',
      seekerId: 'seeker_user',
      utmCampaign: 'test-campaign-1',
      trackingUrl: 'http://backend.com/api/flows?utm_campaign=test-campaign-1',
      status: CampaignStatus.PENDING,
    });

    testCampaign2 = await campaignRepository.createV2({
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 1000,
      price: 10,
      duration: 30,
      trafficSources: 'source1',
      title: 'Test Campaign',
      destinationUrl: 'http://example.com/landing-page',
      providerId: 'provider_user',
      seekerId: 'seeker_user',
      utmCampaign: 'test-campaign-2',
      trackingUrl: 'http://backend.com/api/flows?utm_campaign=test-campaign-2',
      status: CampaignStatus.PENDING,
    });
  });

  await t.test('should query by provider or seeker', async () => {
    // given
    const campaign3: Campaign = {
      demandId: new ObjectId(),
      offerId: new ObjectId(),
      hookId: new ObjectId(),
      goal: 2000,
      price: 20,
      duration: 14,
      trafficSources: 'source2',
      title: 'Campaign 3',
      destinationUrl: 'http://example.com/landing-page',
      providerId: 'seeker_user',
      seekerId: 'provider_user',
      utmCampaign: 'test-campaign-3',
      trackingUrl: 'http://backend.com/api/flows?utm_campaign=test-campaign-3',
      status: CampaignStatus.PENDING,
    };
    await campaignRepository.createV2(campaign3);

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
    assert.equal(campaigns.length, 3);
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
    assert.equal(campaigns.length, 2);
    assert.equal(campaigns[0].providerId, 'provider_user');
  });

  await t.test('should find campaign by ID', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${testCampaign1._id}`,
      headers: {
        'x-user-id': 'provider_user',
      },
    });

    assert.equal(response.statusCode, 200);
    const campaign = response.json();
    assert.equal(campaign._id.toString(), testCampaign1._id?.toString());
    assert.equal(campaign.title, testCampaign1.title);
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
      url: `/api/campaigns/${testCampaign1._id}`,
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
      url: `/api/campaigns/${testCampaign1._id}`,
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
      url: `/api/campaigns/${testCampaign1._id}`,
      headers: {
        'x-user-id': 'unauthorized_user',
      },
    });

    assert.equal(response.statusCode, 403);
  });

  await t.test('should fail validation when proposing new start date', async () => {
    let response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${new ObjectId()}/propose-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
    });
    assert.equal(response.statusCode, 404);

    response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${testCampaign2._id}/propose-date`,
      headers: {
        'x-user-id': 'other_user',
      },
      payload: {
        startDate: new Date().toISOString(),
      },
    });
    assert.equal(response.statusCode, 403);
    assert.equal(response.json().message, 'Only provider or seeker can propose start date');

    response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${testCampaign2._id}/propose-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        startDate: '2023-10-01T00:00:00Z',
      },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().message, 'Start date cannot be in the past');

    response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${testCampaign2._id}/propose-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        startDate: addDays(new Date(), 5).toISOString(),
      },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().message, 'Start date cannot be less than 7 days from now');

    response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${testCampaign1._id}/propose-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        startDate: addDays(new Date(), 8).toISOString(),
      },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().message, 'Cannot change start date for campaign in active status');
  });

  await t.test('should propose new start date', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${testCampaign2._id}/propose-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        startDate: addDays(new Date(), 8).toISOString(),
      },
    });

    assert.equal(response.statusCode, 200);
    const currentDateProposal = response.json();
    assert.equal(currentDateProposal.proposedByUserId, 'provider_user');
    assert.equal(currentDateProposal.proposedByRole, 'provider');
    assert.equal(currentDateProposal.proposedByName, 'provider@test.pl');
    assert.equal(currentDateProposal.proposedStartDate, startOfDay(addDays(new Date(), 8)).toISOString());
    assert.equal(currentDateProposal.status, 'pending');

    const updatedCampaign: Campaign = (await campaignRepository.findById(new ObjectId(testCampaign2._id))) as Campaign;
    assert.equal(updatedCampaign.currentDateProposal?.proposedByUserId, 'provider_user');
    assert.equal(updatedCampaign.currentDateProposal?.proposedByRole, 'provider');
    assert.equal(updatedCampaign.currentDateProposal?.proposedByName, 'provider@test.pl');
    assert.equal(updatedCampaign.currentDateProposal?.proposedStartDate.toISOString(), startOfDay(addDays(new Date(), 8)).toISOString());
    assert.equal(updatedCampaign.currentDateProposal?.status, 'pending');
  });

  await t.test('should fail validation when responding to date proposal', async () => {
    let response = await fastify.inject({
      method: 'PUT',
      url: `/api/campaigns/${new ObjectId()}/respond-to-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        status: 'accepted',
      },
    });
    assert.equal(response.statusCode, 404);

    response = await fastify.inject({
      method: 'PUT',
      url: `/api/campaigns/${testCampaign2._id}/respond-to-date`,
      headers: {
        'x-user-id': 'other_user',
      },
      payload: {
        status: 'accepted',
      },
    });
    assert.equal(response.statusCode, 403);
    assert.equal(response.json().message, 'Only provider or seeker can respond to date proposal');

    response = await fastify.inject({
      method: 'PUT',
      url: `/api/campaigns/${testCampaign1._id}/respond-to-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        status: 'accepted',
      },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().message, 'Date proposal is not pending');

    response = await fastify.inject({
      method: 'PUT',
      url: `/api/campaigns/${testCampaign2._id}/respond-to-date`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        status: 'accepted',
      },
    });
    assert.equal(response.statusCode, 403);
    assert.equal(response.json().message, 'User cannot respond to their own date proposal');
  });

  await t.test('should accept new start date proposal', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: `/api/campaigns/${testCampaign2._id}/respond-to-date`,
      headers: {
        'x-user-id': 'seeker_user',
      },
      payload: {
        status: 'accepted',
      },
    });

    assert.equal(response.statusCode, 200);
    const updatedDateProposal = response.json();
    assert.equal(updatedDateProposal.status, 'accepted');

    const updatedCampaign: Campaign = (await campaignRepository.findById(new ObjectId(testCampaign2._id))) as Campaign;
    assert.equal(updatedCampaign.currentDateProposal?.status, 'accepted');
  });

  await t.test('should fail to update contact info for non-existent campaign', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/campaigns/${new ObjectId()}/contact-info`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        phoneNumber: '+48123456789',
      },
    });
    assert.equal(response.statusCode, 404);
  });

  await t.test('should update contact info of provider', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/campaigns/${testCampaign2._id}/contact-info`,
      headers: {
        'x-user-id': 'provider_user',
      },
      payload: {
        phoneNumber: '+48123456789',
      },
    });

    assert.equal(response.statusCode, 200);
    const contactInfo = response.json();
    assert.equal(contactInfo?.provider?.phoneNumber, '+48123456789');

    const campaignFromDb = await campaignRepository.findById(new ObjectId(testCampaign2._id));
    assert.equal(campaignFromDb?.contactInfo?.provider?.phoneNumber, '+48123456789');
  });

  await t.test('should update contact info of seeker', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/campaigns/${testCampaign2._id}/contact-info`,
      headers: {
        'x-user-id': 'seeker_user',
      },
      payload: {
        phoneNumber: '+48987654321',
      },
    });

    assert.equal(response.statusCode, 200);
    const contactInfo = response.json();
    assert.equal(contactInfo?.seeker?.phoneNumber, '+48987654321');

    const campaignFromDb = await campaignRepository.findById(new ObjectId(testCampaign2._id));
    assert.equal(campaignFromDb?.contactInfo?.seeker?.phoneNumber, '+48987654321');
  });
});
