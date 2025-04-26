import { Db, ObjectId } from 'mongodb';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { HookRepository } from '../../../src/features/hook/hook.repository';
import { Hook, HookCategory, HookStatus } from '../../../src/features/hook/hook.types';
import { DemandRepository } from '../../../src/features/marketplace/demand.repository';
import { Demand, DemandStatus, Offer, OfferStatus } from '../../../src/features/marketplace/marketplace.types';
import { OfferRepository } from '../../../src/features/marketplace/offer.repository';
import { build, clearDatabase } from '../../helper';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import { addDays } from 'date-fns/addDays';

test('marketplace:flow', async (t) => {
  const fastify = await build(t);
  const hookRepository: HookRepository = fastify.repository.hook;
  const offerRepository: OfferRepository = fastify.repository.offer;
  const demandRepository: DemandRepository = fastify.repository.demand;
  const db: Db = fastify.mongo.db;

  let hook: Hook;
  let offer: Offer;
  let demand: Demand;

  t.before(async () => {
    await clearDatabase(fastify);

    hook = await hookRepository.create({
      category: HookCategory.BUSINESS,
      description: 'Philadelphian Demo is a demo website for Philadelphian.',
      name: 'Philadelphian Demo',
      status: HookStatus.ACTIVE,
      userId: 'demand_user',
      widgetId: new ObjectId('67c9634c69bc111933f0d4db'),
      domain: 'https://philadelphian.example.com',
    } as any);

    demand = await demandRepository.create({
      hookId: new ObjectId(hook._id),
      userId: 'demand_user',
      title: 'Driving qualified tech professionals to our new project management',
      description: 'bar',
      goal: 1000,
      budget: { min: 100, max: 1000 },
      duration: 7,
      audience: 'baz',
      status: DemandStatus.OPEN,
    });

    offer = await offerRepository.create({
      demandId: new ObjectId(demand._id),
      hookId: new ObjectId(demand.hookId),
      providerId: 'offer_user',
      seekerId: demand.userId,
      trafficVolume: 1000,
      price: 900,
      duration: 7,
      trafficSources: 'source1,source2',
      pitch: 'This is a great offer',
      audience: 'Target audience description',
      status: OfferStatus.PENDING,
    });
  });

  await t.test('should fail when status update is done by non-seeker', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': 'non_seeker_user',
      },
      payload: {
        status: OfferStatus.REJECTED,
      },
    });

    assert.equal(response.statusCode, 403);
  });

  await t.test('should update status when offer is rejected', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': offer.seekerId,
      },
      payload: {
        status: OfferStatus.REJECTED,
      },
    });

    assert.equal(response.statusCode, 200);
    const updatedOffer = response.json() as Offer;
    assert.equal(updatedOffer.status, OfferStatus.REJECTED);
    const campaign = await db.collection('campaigns').findOne({ offerId: new ObjectId(offer._id) } as any);
    assert.ok(!campaign);
  });

  await t.test('should update only status when status is passed', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': offer.seekerId,
      },
      payload: {
        status: OfferStatus.PENDING,
        price: 1000,
      },
    });
    assert.equal(response.statusCode, 200);
    const updatedOffer = response.json() as Offer;
    assert.equal(updatedOffer.status, OfferStatus.PENDING);
    assert.equal(updatedOffer.price, 900);
  });

  await t.test('should create campaign when offer is accepted', async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/api/offers/${offer._id}`,
      headers: {
        'x-user-id': offer.seekerId,
      },
      payload: {
        status: OfferStatus.ACCEPTED,
      },
    });

    assert.equal(response.statusCode, 200);
    const updatedOffer = response.json() as Offer;
    assert.equal(updatedOffer.status, OfferStatus.ACCEPTED);

    const campaign = await db.collection('campaigns').findOne({ offerId: new ObjectId(offer._id) } as any);
    assert.ok(campaign);
    assert.equal(campaign.offerId.toString(), offer._id);
    assert.equal(campaign.demandId.toString(), demand._id);
    assert.equal(campaign.hookId.toString(), demand.hookId);
    assert.equal(campaign.providerId, offer.providerId);
    assert.equal(campaign.seekerId, offer.seekerId);
    assert.equal(campaign.title, demand.title);
    assert.equal(campaign.goal, offer.trafficVolume);
    assert.equal(campaign.price, offer.price);
    assert.equal(campaign.duration, offer.duration);
    assert.equal(campaign.trafficSources, offer.trafficSources);
    assert.equal(campaign.status, 'pending');
    assert.equal(campaign.trackingUrl, `http://backend.com/api/flows?utm_campaign=${campaign.utmCampaign}`);

    const expectedStartDate = startOfDay(addDays(new Date(), 7));
    assert.equal(campaign.startDate.getTime(), expectedStartDate.getTime());

    const expectedEndDate = endOfDay(addDays(new Date(), 7 + offer.duration - 1));
    assert.equal(campaign.endDate.getTime(), expectedEndDate.getTime());
  });
});
