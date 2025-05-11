import * as assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/marketplace/campaign/campaign.repository';
import { CampaignSchedulerService } from '../../../src/features/marketplace/campaign/campaign.scheduler.service';
import { CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { build, clearDatabase } from '../../helper';
import { createCampaign } from '../../builders';

test('campaign.scheduler', async (t) => {
  const fastify = await build(t);
  const campaignRepository: CampaignRepository = fastify.repository.campaign;
  const campaignScheduler = new CampaignSchedulerService(campaignRepository);

  t.beforeEach(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should activate only the pending campaigns where startDate is in past', async () => {
    // given
    const now = new Date();
    const pastHour = new Date(now.getTime() - 1000 * 60 * 60);
    const pastTwoHours = new Date(now.getTime() - 1000 * 60 * 60 * 2);
    const nextHour = new Date(now.getTime() + 1000 * 60 * 60);
    const nextTwoHours = new Date(now.getTime() + 1000 * 60 * 60 * 2);

    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.PENDING));
    await campaignRepository.save(createCampaign(nextHour, nextTwoHours, CampaignStatus.PENDING));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.ACTIVE));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.CANCELLED));
    await campaignRepository.save(createCampaign(pastTwoHours, pastHour, CampaignStatus.COMPLETED));

    // when
    const activatedCampaigns = await campaignScheduler.activateCampaigns();

    // then
    assert.strictEqual(activatedCampaigns.length, 1);

    const activeCampaigns = await campaignRepository.queryV2({
      status: CampaignStatus.ACTIVE,
    });
    assert.strictEqual(activeCampaigns.length, 2);

    const pendingCampaigns = await campaignRepository.queryV2({
      status: CampaignStatus.PENDING,
    });
    assert.strictEqual(pendingCampaigns.length, 1);
  });

  await t.test('should complete only the active campaigns where endDate is in past', async () => {
    // given
    const now = new Date();
    const pastHour = new Date(now.getTime() - 1000 * 60 * 60);
    const pastTwoHours = new Date(now.getTime() - 1000 * 60 * 60 * 2);
    const nextHour = new Date(now.getTime() + 1000 * 60 * 60);
    const nextTwoHours = new Date(now.getTime() + 1000 * 60 * 60 * 2);

    await campaignRepository.save(createCampaign(nextHour, nextTwoHours, CampaignStatus.PENDING));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.ACTIVE));
    await campaignRepository.save(createCampaign(pastTwoHours, pastHour, CampaignStatus.ACTIVE));
    await campaignRepository.save(createCampaign(pastHour, nextHour, CampaignStatus.CANCELLED));
    await campaignRepository.save(createCampaign(pastTwoHours, pastHour, CampaignStatus.COMPLETED));

    // when
    const completedCampaigns = await campaignScheduler.completeCampaigns();

    // then
    assert.strictEqual(completedCampaigns.length, 1);

    const activeCampaigns = await campaignRepository.queryV2({
      status: CampaignStatus.ACTIVE,
    });
    assert.strictEqual(activeCampaigns.length, 1);

    const completeCampaigns = await campaignRepository.queryV2({
      status: CampaignStatus.COMPLETED,
    });
    assert.strictEqual(completeCampaigns.length, 2);
  });
});
