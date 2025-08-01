import { Collection, ObjectId } from 'mongodb';
import { BaseRepository } from '../base.repository';
import { Conversation, Message } from './conversation.types';
import { send } from 'process';

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor(collection: Collection<Conversation>) {
    super(collection);
  }

  async findByCampaignId(campaignId: ObjectId): Promise<Conversation | null> {
    const filter = {
      campaignId: new ObjectId(campaignId),
    };
    return this.queryOne(filter);
  }

  async appendMessage(campaignId: ObjectId, message: Message): Promise<Conversation | null> {
    const addMessageUpdate = {
      $push: {
        messages: {
          _id: new ObjectId(),
          senderId: message.senderId,
          senderRole: message.senderRole,
          content: message.content,
          createdAt: new Date(),
        },
      },
      $inc: {
        [`unreadCount.${message.receiverRole}`]: 1,
      },
      $set: {
        updatedAt: new Date(),
      },
    };
    return this.collection.findOneAndUpdate({ campaignId: campaignId }, addMessageUpdate, {
      returnDocument: 'after',
    });
  }
}
