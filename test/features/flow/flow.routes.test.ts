import * as assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/marketplace/campaign/campaign.repository';
import { CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { createCampaign, createWidget } from '../../builders';
import { build, clearDatabase } from '../../helper';
import { ObjectId } from '@fastify/mongodb';
import { WidgetRepository } from '../../../src/features/widget/widget.repository';

test('flow:routes', async (t) => {
  const fastify = await build(t);
  const campaignRepository: CampaignRepository = fastify.repository.campaign;
  const widgetRepository: WidgetRepository = fastify.repository.widget;

  t.beforeEach(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should return dynamic code', async () => {
    // given
    const now = new Date();
    const pastHour = new Date(now.getTime() - 1000 * 60 * 60);
    const nextHour = new Date(now.getTime() + 1000 * 60 * 60);

    let campaign = createCampaign(pastHour, nextHour, CampaignStatus.ACTIVE);
    campaign = (await campaignRepository.save(campaign))!;
    let widget = createWidget(campaign.hookId);
    widget = (await widgetRepository.save(widget))!;

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/public/flows?utm_campaign=${campaign?.utmCampaign}`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
  });

  await t.test('Should return 404 if campaign not found', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/public/flows?utm_campaign=unknown-campaign`,
    });

    assert.equal(response.statusCode, 404);
  });

  await t.test('Should return 400 if campaign is not active', async () => {
    // given
    const now = new Date();
    const pastTwoHours = new Date(now.getTime() - 1000 * 60 * 60 * 2);
    const pastOneHour = new Date(now.getTime() - 1000 * 60 * 60);

    let campaign = createCampaign(pastTwoHours, pastOneHour, CampaignStatus.PENDING);
    campaign = (await campaignRepository.save(campaign))!;
    let widget = createWidget(campaign.hookId);
    widget = (await widgetRepository.save(widget))!;

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/public/flows?utm_campaign=${campaign?.utmCampaign}`,
    });

    assert.equal(response.statusCode, 400);
  });
});
