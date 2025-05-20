import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { Campaign, CampaignStatus } from '../../../src/features/marketplace/marketplace.types';
import { createCampaign } from '../../builders';
import { add } from 'date-fns/add';
import { sub } from 'date-fns/sub';
import { CampaignRepository } from '../../../src/features/marketplace/campaign/campaign.repository';
import { ConversationDto } from '../../../src/features/conversation/conversation.types';
import { ConversationRepository } from '../../../src/features/conversation/conversation.repository';
import { ObjectId } from '@fastify/mongodb';

test('conversation:routes', async (t) => {
  const fastify = await build(t);
  const campaignRepository: CampaignRepository = fastify.repository.campaign;
  const conversationRepository: ConversationRepository = fastify.repository.conversation;

  let campaign: Campaign;

  t.beforeEach(async () => {
    await clearDatabase(fastify);

    campaign = createCampaign(sub(new Date(), { hours: 2 }), add(new Date(), { hours: 2 }), CampaignStatus.ACTIVE);
    campaign = await campaignRepository.createV2(campaign);
    if (!campaign) {
      throw new Error('Campaign not created');
    }
  });

  await t.test('should create a new conversation and append messages', async () => {
    let response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${campaign?._id}/conversations/messages`,
      payload: {
        content: 'Hello World!',
        campaignId: campaign?._id,
      },
      headers: {
        'x-user-id': campaign?.seekerId,
      },
    });

    assert.equal(response.statusCode, 200);

    const conversation = (await conversationRepository.findByCampaignId(campaign._id!))!;
    assert.ok(conversation.messages.length === 1);
    assert.equal(conversation.messages[0].content, 'Hello World!');
    assert.equal(conversation.messages[0].senderRole, 'seeker');
    assert.equal(conversation.messages[0].senderId, campaign.seekerId);
    assert.equal(conversation.unreadCount.seeker, 0);
    assert.equal(conversation.unreadCount.provider, 1);
    assert.equal(conversation.participants.seeker.userId, campaign.seekerId);
    assert.equal(conversation.participants.provider.userId, campaign.providerId);
    assert.equal(conversation.campaignId.toString(), campaign._id?.toString());
    assert.equal(conversation.type, 'campaign');

    response = await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${campaign?._id}/conversations/messages`,
      payload: {
        content: 'Hello Space!',
        campaignId: campaign?._id,
      },
      headers: {
        'x-user-id': campaign?.providerId,
      },
    });
    assert.equal(response.statusCode, 200);
    const updatedConversation = (await conversationRepository.findByCampaignId(campaign._id!))!;
    assert.ok(updatedConversation.messages.length === 2);
    assert.equal(updatedConversation.messages[1].content, 'Hello Space!');
    assert.equal(updatedConversation.messages[1].senderRole, 'provider');
    assert.equal(updatedConversation.messages[1].senderId, campaign.providerId);
  });

  await t.test('should find a conversation by campaignId and seekerId', async () => {
    // given
    await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${campaign?._id}/conversations/messages`,
      payload: {
        content: 'Hello World!',
        campaignId: campaign?._id,
      },
      headers: {
        'x-user-id': campaign?.seekerId,
      },
    });

    // when
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${campaign?._id}/conversations`,
      headers: {
        'x-user-id': campaign?.seekerId,
      },
    });

    // then
    assert.equal(response.statusCode, 200);
    const conversation = response.json();
    assert.ok(conversation.messages.length > 0);
  });

  await t.test('should find a conversation by campaignId and provider', async () => {
    // given
    await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${campaign?._id}/conversations/messages`,
      payload: {
        content: 'Hello World!',
        campaignId: campaign?._id,
      },
      headers: {
        'x-user-id': campaign?.seekerId,
      },
    });

    // when
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${campaign?._id}/conversations`,
      headers: {
        'x-user-id': campaign?.providerId,
      },
    });

    // then
    assert.equal(response.statusCode, 200);
    const conversation = response.json();
    assert.ok(conversation.messages.length > 0);
  });

  await t.test('should return 404 if conversation not found', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${new ObjectId()}/conversations`,
      headers: {
        'x-user-id': campaign?.seekerId,
      },
    });
    assert.equal(response.statusCode, 404);
  });

  await t.test('should return 403 if user is not part of the conversation', async () => {
    // given
    await fastify.inject({
      method: 'POST',
      url: `/api/campaigns/${campaign?._id}/conversations/messages`,
      payload: {
        content: 'Hello World!',
        campaignId: campaign?._id,
      },
      headers: {
        'x-user-id': campaign?.seekerId,
      },
    });

    // when
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/campaigns/${campaign?._id}/conversations`,
      headers: {
        'x-user-id': 'unknown-user',
      },
    });

    // then
    assert.equal(response.statusCode, 403);
  });
});
