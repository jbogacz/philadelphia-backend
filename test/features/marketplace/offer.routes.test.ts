import * as assert from 'node:assert';
import { test } from 'node:test';

import { DemandRepository } from '../../../src/features/marketplace/demand.repository';
import { Demand, DemandStatus, Offer, OfferDto } from '../../../src/features/marketplace/marketplace.types';
import { OfferRepository } from '../../../src/features/marketplace/offer.repository';
import { build, clearDatabase } from '../../helper';
import { Db, ObjectId } from 'mongodb';

test('offer.routes', async (t) => {
  const fastify = await build(t);
  const offerRepository: OfferRepository = fastify.repository.offer;
  const demandRepository: DemandRepository = fastify.repository.demand;
  const db: Db = fastify.mongo.db;

  let offer: Offer;
  let demand: Demand;

  t.before(async () => {
    await clearDatabase(fastify);

    demand = await demandRepository.create({
      hookId: '67c9634c69bc111933f0d4db',
      userId: 'demand_user',
      title: 'foo',
      description: 'bar',
      goal: 1000,
      budget: { min: 100, max: 1000 },
      duration: 30,
      audience: 'baz',
      status: DemandStatus.OPEN,
    });
  });

  await t.test('should create new document', async () => {
    const payload: OfferDto = {
      demandId: demand._id as string,
      providerId: 'unknown',
      trafficVolume: 1000,
      price: 900,
      duration: 30,
      trafficSources: 'source1,source2',
      pitch: 'This is a great offer',
      audience: 'Target audience description',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/offers',
      headers: {
        'x-user-id': 'offer_user',
      },
      payload,
    });

    assert.equal(response.statusCode, 201);

    offer = response.json() as Offer;
    const createdOffer = await db
      .collection('offers')
      .findOne({ _id: ObjectId.createFromHexString(offer._id!), demandId: demand._id } as any);
    assert.equal(createdOffer?.providerId, 'offer_user');
  });

  await t.test('should find by query', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/offers?providerId=offer_user`,
      headers: {
        'x-user-id': 'offer_user',
      },
    });

    assert.equal(response.statusCode, 200);
    const offers = response.json() as Offer[];
    assert.ok(offers.length > 0);
  });

  await t.test('should update existing document', async () => {
    const payload: OfferDto = {
      demandId: demand._id as string,
      providerId: 'offer_user',
      trafficVolume: 1200,
      price: 1100,
      duration: 30,
      trafficSources: 'source1,source2',
      pitch: 'Updated offer',
      audience: 'Updated audience description',
    };

    const createResponse = await fastify.inject({
      method: 'POST',
      url: '/api/offers',
      headers: {
        'x-user-id': 'offer_user',
      },
      payload,
    });

    offer = createResponse.json() as Offer;

    const updateResponse = await fastify.inject({
      method: 'PUT',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': 'offer_user',
      },
      payload,
    });

    assert.equal(updateResponse.statusCode, 200);
    const updatedOffer = await offerRepository.findByPrimaryId(offer._id as string);
    assert.equal(updatedOffer?.trafficVolume, 1200);
  });

  await t.test('should return list of offers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/offers',
      headers: {
        'x-user-id': 'offer_user',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.json().length > 0);
  });

  await t.test('should return offer by id', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': 'offer_user',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json()._id, offer._id);
  });

  await t.test('should return 404 for non-existing offer', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/offers/invalid_id`,
      headers: {
        'x-user-id': 'offer_user',
      },
    });

    assert.equal(response.statusCode, 404);
  });

  await t.test('should delete offer', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': 'offer_user',
      },
    });

    assert.equal(response.statusCode, 204);
    const deletedOffer = await offerRepository.findByPrimaryId(offer._id as string);
    assert.equal(deletedOffer, null);
  });

  await t.test('should return 404 for deleted offer', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': 'offer_user',
      },
    });

    assert.equal(response.statusCode, 404);
  });
});
