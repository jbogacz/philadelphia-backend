import { FastifyMongoObject, ObjectId } from '@fastify/mongodb';
import { ForbiddenError, NotFoundError } from '../../common/errors';
import { CampaignRepository } from '../marketplace/campaign/campaign.repository';
import { Campaign } from '../marketplace/marketplace.types';
import { ConversationRepository } from './conversation.repository';
import { Conversation, ConversationDto, MessageDto } from './conversation.types';
import { LoggerService } from '../../common';
import { txTemplate } from '../base.repository';

export class ConversationService {
  private logger = LoggerService.getLogger('feature.conversation.ConversationService');

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly campaignRepository: CampaignRepository,
    private readonly mongo: FastifyMongoObject
  ) {}

  async appendCampaignMessage(campaignId: string, userId: string, message: MessageDto): Promise<ConversationDto> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError(`Campaign with id ${campaignId} not found`);
    }
    if (campaign.seekerId !== userId && campaign.providerId !== userId) {
      throw new NotFoundError(`User with id ${userId} is not part of the campaign`);
    }

    // Check if the conversation already exists and create it if not.
    // This is done in a transaction to ensure atomicity if multiple users are trying to create the conversation at the same time.
    await txTemplate.withTransaction(this.mongo.client)(async (session) => {
      let conversation: Conversation | null = await this.conversationRepository.queryOne({ campaignId: campaign._id }, { session });
      if (!conversation) {
        conversation = await this.conversationRepository.create(this.initCampaignConversation(campaign), { session });
        this.logger.info('Created new conversation:', conversation);
      }
    });

    const senderRole = campaign.seekerId === userId ? 'seeker' : 'provider';
    const receiverRole = senderRole === 'seeker' ? 'provider' : 'seeker';

    const result = await this.conversationRepository.appendMessage(campaign._id, {
      senderId: userId,
      senderRole: senderRole,
      receiverRole: receiverRole,
      content: message.content,
    });
    return result as ConversationDto;
  }

  async findCampaignConversation(campaignId: string, userId: string): Promise<ConversationDto | null> {
    const conversation = await this.conversationRepository.findByCampaignId(new ObjectId(campaignId));
    if (!conversation) {
      this.logger.info(`Conversation with campaignId ${campaignId} not found`);
      return null;
    }
    if (conversation.participants.seeker.userId !== userId && conversation.participants.provider.userId !== userId) {
      throw new ForbiddenError(`User with id ${userId} is not part of the conversation`);
    }
    return conversation;
  }

  private initCampaignConversation(campaign: Campaign): Conversation {
    return {
      type: 'campaign',
      campaignId: new ObjectId(campaign._id),
      participants: {
        seeker: {
          userId: campaign.seekerId,
          lastReadAt: new Date(),
        },
        provider: {
          userId: campaign.providerId,
          lastReadAt: new Date(),
        },
      },
      messages: [],
      unreadCount: {
        seeker: 0,
        provider: 0,
      },
    };
  }
}
