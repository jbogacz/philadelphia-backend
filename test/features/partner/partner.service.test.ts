import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';

import { hookWidgetPairs, generateTracesData } from './sample.data';
import { PartnerService } from '../../../src/features/partner/partner.service';
import { PartnerQuery } from '../../../src/features/partner/partner.types';

test('partner:service', async (t) => {
  const fastify = await build(t);
  const mongo = fastify.mongo.db;
  const partnerService = fastify.service.partner as PartnerService;

  t.before(async () => {
    await clearDatabase(fastify);

    for (const { hook, widget } of hookWidgetPairs) {
      await mongo.collection('hooks').insertOne(hook);
      await mongo.collection('widgets').insertOne(widget);
    }

    const traces = generateTracesData().flatMap((item) => item);

    for (const trace of traces) {
      await mongo.collection('traces').insertOne(trace);
    }
  });

  await t.test('should return 4 random partners and skip publisher hook', async () => {
    // given
    const coffeeShopQuery: PartnerQuery = {
      widgetKey: '111d5f62-22c5-408d-a464-77c570fdd6d1',
    };

    // when
    const response = await partnerService.aggregateData(coffeeShopQuery);

    // then
    assert.equal(response.partners.length, 4);
    assert.ok(response.partners.find((partner) => partner.name === 'Coffee Shop') === undefined);
    assert.ok(response.partners[0].description);
    assert.ok(response.partners[0].url);
    assert.ok(response.partners[0].widgetKey);
    assert.ok(response.partners[0].imageUrl);
    assert.ok(response.partners[0].todayVisits);
    assert.ok(response.partners[0].promoMessage);
  });
});
