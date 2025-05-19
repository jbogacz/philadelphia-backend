import { Static, Type } from '@sinclair/typebox';
import { BaseSchemaV2, DateTimeType, IEntityV2, ObjectIdType } from '../base.repository';

/**
 * SCHEMA
 */
export const ConversationSchema = Type.Intersect([
  BaseSchemaV2,
  Type.Object({
    type: Type.Union([Type.Literal('campaign')]),

    campaignId: ObjectIdType,

    participants: Type.Object({
      seeker: Type.Object({
        userId: Type.String(),
        lastReadAt: DateTimeType,
      }),
      provider: Type.Object({
        userId: Type.String(),
        lastReadAt: DateTimeType,
      }),
    }),

    messages: Type.Array(
      Type.Object({
        _id: ObjectIdType,
        senderRole: Type.Union([Type.Literal('seeker'), Type.Literal('provider')]),
        content: Type.String(),
        createdAt: DateTimeType,
      })
    ),

    unreadCount: Type.Object({
      seeker: Type.Number(),
      provider: Type.Number(),
    }),
  }),
]);

export const MessageDtoSchema = Type.Object({
  content: Type.String(),
});

/**
 * MODEL
 */
export type Conversation = Static<typeof ConversationSchema> & IEntityV2;

export type Message = {
  senderRole: 'seeker' | 'provider';
  receiverRole: 'seeker' | 'provider';
  content: string;
}

/**
 * DTO
 */
export type MessageDto = Static<typeof MessageDtoSchema>;
export type ConversationDto = Static<typeof ConversationSchema>;
