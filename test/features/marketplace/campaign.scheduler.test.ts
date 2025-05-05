import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { ObjectId } from '@fastify/mongodb';
import { Campaign, CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { CampaignRepository } from '../../../src/features/marketplace/campaign/campaign.repository';
import { CampaignSchedulerService } from '../../../src/features/marketplace/campaign/campaign.scheduler.service';

test('campaign.scheduler', async (t) => {
  const fastify = await build(t);
  const db = fastify.mongo.db;
  const campaignRepository: CampaignRepository = fastify.repository.campaign;
  const campaignScheduler = new CampaignSchedulerService(campaignRepository);

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should activate only the pending campaigns where startDate is in past', async () => {
    // given
    const now = new Date();
    const pastHour = new Date(now.getTime() - 1000 * 60 * 60);
    const nextHour = new Date(now.getTime() + 1000 * 60 * 60);
    const nextTwoHours = new Date(now.getTime() + 1000 * 60 * 60 * 2);

    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.PENDING));
    await campaignRepository.save(createCampaign(nextHour, nextTwoHours, CampaignStatus.PENDING));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.ACTIVE));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.PAUSED));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.CANCELLED));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.COMPLETED));

    // when
    const activatedCampaigns = await campaignScheduler.activateCampaigns();

    // then
    assert.strictEqual(activatedCampaigns.length, 1);

    const activeCampaigns = await campaignRepository.queryV2({
      status: CampaignStatus.ACTIVE,
    });
    assert.strictEqual(activeCampaigns.length, 2);
  });
});

function createCampaign(startDate: Date, endDate: Date, status: CampaignStatus): Campaign {
  return {
    demandId: new ObjectId(),
    offerId: new ObjectId(),
    hookId: new ObjectId(),
    providerId: 'providerId',
    seekerId: 'seekerId',
    goal: 1000,
    price: 900,
    duration: 30,
    trafficSources: 'source1,source2',
    trackingUrl: 'https://example.com/tracking',
    title: 'Campaign Title',
    destinationUrl: 'https://example.com',
    utmCampaign: 'utm_campaign',
    startDate: startDate,
    endDate: endDate,
    status: status,
  };
}
