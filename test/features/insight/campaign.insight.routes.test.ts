import { ObjectId } from '@fastify/mongodb';
import { randomUUID } from 'node:crypto';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { CampaignRepository } from '../../../src/features/marketplace/campaign/campaign.repository';
import { Campaign, CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { WidgetRepository } from '../../../src/features/widget/widget.repository';
import { Widget } from '../../../src/features/widget/widget.types';
import { createCampaign, createWidget } from '../../builders';
import { build, clearDatabase } from '../../helper';
import { TraceRepository } from '../../../src/features/trace/trace.repository';

test('campaign.insight:routes', async (t) => {
  const fastify = await build(t);
  const campaignRepository: CampaignRepository = fastify.repository.campaign;
  const widgetRepository: WidgetRepository = fastify.repository.widget;
  const traceRepository: TraceRepository = fastify.repository.trace;
  const tracesCollection = fastify.mongo.db.collection('traces');

  let campaign: Campaign;
  let widget: Widget;

  t.beforeEach(async () => {
    await clearDatabase(fastify);

    const now = new Date();
    const pastTwoWeeks = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14);
    const nextTwoWeeks = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

    campaign = (await campaignRepository.save(createCampaign(pastTwoWeeks, nextTwoWeeks, CampaignStatus.ACTIVE)))!;
    widget = (await widgetRepository.save(createWidget(campaign?.hookId)))!;
  });

  await t.test('should return insights overview', async () => {
    // given
    await tracesCollection.insertOne(createTrace(-10, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-10, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-9, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-9, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-5, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-5, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-5, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(0, 'fingerprint-id-1'));
    await tracesCollection.insertOne(createTrace(-10, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(-9, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(-5, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(-4, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(-2, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(-1, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(1, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(2, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(3, 'fingerprint-id-2'));
    await tracesCollection.insertOne(createTrace(4, 'fingerprint-id-2'));

    // when
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/insights/campaign/${campaign._id}`,
    });

    // then
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.campaignId, campaign._id?.toString());
    assert.equal(body.summary.uniqueVisitors, 10);
  });

  function createTrace(day: number, fingerprintId: string) {
    const now = new Date();
    return {
      campaignId: new ObjectId(campaign._id),
      createdAt: new Date(now.getTime() + day * 1000 * 60 * 60 * 24),
      fingerprint: {
        fingerprintId: fingerprintId,
      },
      hookId: new ObjectId(campaign.hookId),
      traceId: randomUUID(),
      type: 'flow',
      updatedAt: new Date(now.getTime() + day * 1000 * 60 * 60 * 24),
      utmCampaign: campaign.utmCampaign,
      widgetKey: widget.widgetKey,
      widgetId: new ObjectId(widget._id),
    };
  }
});
