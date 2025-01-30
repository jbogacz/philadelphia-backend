import { build, clearDatabase } from '../../helper';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/campaign/campaign.repository';
import { Campaign, CampaignStatus } from '../../../src/features/campaign/campaign.types';
import { FlowEventDto, FlowSource } from '../../../src/features/flow/flow.types';

test('flow:routes', async t => {
  const fastify = await build(t);
  const campaignRepository: CampaignRepository = fastify.repository.campaign;

  const CAMPAIGN_ID = 'campaign-1';

  t.before(async () => {
    await clearDatabase(fastify);

    const campaign: Campaign = {
      campaignId: CAMPAIGN_ID,
      advertiserId: 'advertiser-1',
      landingPage: 'https://quip.com/',
      status: CampaignStatus.ACTIVE,
      traces: [],
    };
    await campaignRepository.save(campaign);
  });

  await t.test('should return dynamic code', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/flow?utm_campaign=${CAMPAIGN_ID}&utm_source=instagram&utm_content=content-1`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
  });

  await t.test('should capture flow event and append trace to the campaign', async () => {
    const traceId = crypto.randomUUID();
    const fingerprintId = crypto.randomUUID();
    const flowEvent: FlowEventDto = {
      traceId: traceId,
      fingerprint: { fingerprintId },
      publisherId: 'publisher-1',
      campaignId: CAMPAIGN_ID,
      source: FlowSource.INSTAGRAM,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/flow',
      payload: flowEvent,
    });

    assert.equal(response.statusCode, 204);

    const campaign = await campaignRepository.findByCampaignId(CAMPAIGN_ID);
    assert.ok(campaign);
    assert.equal(campaign.traces.length, 1);
  });

  await t.test('should return 400 for invalid campaignId', async () => {
    const traceId = crypto.randomUUID();
    const fingerprintId = crypto.randomUUID();
    const flowEvent: FlowEventDto = {
      traceId: traceId,
      fingerprint: { fingerprintId },
      publisherId: 'publisher-1',
      campaignId: 'unknown-campaign',
      source: FlowSource.INSTAGRAM,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/flow',
      payload: flowEvent,
    });

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), {
      statusCode: 400,
      error: 'MongoError',
      message: 'Missing campaign with campaignId: unknown-campaign',
    });
  });

  await t.test('should return 400 for invalid payload', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/flow',
      payload: {},
    });

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), {
      statusCode: 400,
      error: 'Error',
      message: "body must have required property 'fingerprint'",
    });
  });
});
