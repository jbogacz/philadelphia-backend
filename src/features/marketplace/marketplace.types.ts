import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, BaseSchemaV2, DateTimeType, IEntity, IEntityV2, ObjectIdType, RangeSchema } from '../base.repository';

/**
 * ENUMS
 */
export enum DemandStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OfferStatus {
  PENDING = 'pending', // Awaiting decision
  ACCEPTED = 'accepted', // Accepted by seeker
  REJECTED = 'rejected', // Rejected by seeker
}

export enum CampaignStatus {
  PENDING = 'pending', // Created but not started
  ACTIVE = 'active', // Currently running
  PAUSED = 'paused', // Temporarily on hold
  COMPLETED = 'completed', // Successfully finished
  CANCELLED = 'cancelled', // Terminated early
}

/**
 * SCHEMA
 */
export const DemandSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    hookId: ObjectIdType,
    userId: Type.String(),
    title: Type.String(),
    description: Type.String(),
    goal: Type.Number(),
    budget: RangeSchema,
    duration: Type.Union([Type.Literal(7), Type.Literal(14), Type.Literal(30)]),
    status: Type.Enum(DemandStatus),
    audience: Type.String(),
  }),
]);

export const DemandQuerySchema = Type.Object({
  userId: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(DemandStatus)),
  hookId: Type.Optional(ObjectIdType),
});

export const DemandDtoSchema = Type.Composite([
  Type.Omit(DemandSchema, ['createdAt', 'updatedAt', 'budget', 'status']),
  Type.Object({
    createdAt: Type.Optional(DateTimeType),
    updatedAt: Type.Optional(DateTimeType),
    budget: Type.Object({
      min: Type.Number(),
      max: Type.Number(),
    }),
    status: Type.Optional(Type.Enum(DemandStatus)),
  }),
]);

export const UpdateDemandDtoSchema = Type.Composite([
  Type.Partial(Type.Omit(DemandSchema, ['createdAt', 'updatedAt', 'budget'])),
  Type.Object({
    createdAt: Type.Optional(DateTimeType),
    updatedAt: Type.Optional(DateTimeType),
    budget: Type.Optional(
      Type.Object({
        min: Type.Optional(Type.Number()),
        max: Type.Optional(Type.Number()),
      })
    ),
  }),
]);

export const OfferSchema = Type.Intersect([
  BaseSchemaV2,
  Type.Object({
    demandId: ObjectIdType,
    hookId: ObjectIdType,
    providerId: Type.String(), // Provider's user ID (offer provider)
    seekerId: Type.String(), // Seeker's user ID (demand seeker)

    // Core offer details
    trafficVolume: Type.Number(),
    price: Type.Number(),
    duration: Type.Union([Type.Literal(7), Type.Literal(14), Type.Literal(30)]),

    // Decision-making assistance fields
    trafficSources: Type.String(),
    pitch: Type.String(),
    audience: Type.String(),

    status: Type.Enum(OfferStatus, { default: OfferStatus.PENDING }), // Offer status
  }),
]);

export const OfferQuerySchema = Type.Object({
  providerId: Type.Optional(Type.String()),
  seekerId: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(OfferStatus)),
});

export const UpdateOfferDtoSchema = Type.Composite([
  Type.Partial(Type.Omit(OfferSchema, ['createdAt', 'updatedAt', 'status', 'hookId', 'seekerId'])),
  Type.Object({
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
    status: Type.Optional(Type.Enum(OfferStatus)),
  }),
]);

export const CampaignDateProposalSchema = Type.Object({
  proposedByUserId: Type.String(),
  proposedByName: Type.String(),
  proposedByRole: Type.Union([Type.Literal('provider'), Type.Literal('seeker')]),
  proposedStartDate: DateTimeType,
  reason: Type.Optional(Type.String()),
  status: Type.Union([Type.Literal('pending'), Type.Literal('accepted'), Type.Literal('rejected')]),
  proposedAt: DateTimeType,
});

export const CampaignSchema = Type.Intersect([
  BaseSchemaV2,
  Type.Object({
    demandId: ObjectIdType,
    offerId: ObjectIdType,
    hookId: ObjectIdType,

    // Campaign details
    goal: Type.Number(),
    price: Type.Number(),
    duration: Type.Union([Type.Literal(7), Type.Literal(14), Type.Literal(30)]),
    trafficSources: Type.String(),
    title: Type.String(),
    utmCampaign: Type.String(), // Unique identifier for the campaign

    // Core participants
    providerId: Type.String(),
    seekerId: Type.String(),

    // Tracking
    trackingUrl: Type.Optional(Type.String()),
    startDate: Type.Optional(DateTimeType),
    endDate: Type.Optional(DateTimeType),

    // Status management
    status: Type.Optional(Type.Enum(CampaignStatus)),

    currentDateProposal: Type.Optional(CampaignDateProposalSchema),
  }),
]);

export const CampaignQuerySchema = Type.Object({
  providerId: Type.Optional(Type.String()),
  seekerId: Type.Optional(Type.String()),
  userId: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(CampaignStatus)),
});

export const ProfileSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    userId: Type.String(),
    provider: Type.Object({
      title: Type.String(), // Provider's title

      defaults: Type.Object({
        audienceDescription: Type.Optional(Type.String()), // General audience description
        trafficSources: Type.Optional(Type.String()), // Specific sources for THIS proposal (may differ from profile)
        pitch: Type.Optional(Type.String()), // Provider's sales pitch/message explaining their offer
      }),

      performanceStats: Type.Optional(
        Type.Object({
          campaignsCompleted: Type.Number({ default: 0 }), // Number of campaigns completed
          averageRating: Type.Number({ default: 0 }), // Average rating from past campaigns
          completionRate: Type.Number({ default: 0 }), // % of promised traffic delivered in past campaigns
        })
      ),
    }),
  }),
]);

/**
 * MODEL
 */
export type Demand = Static<typeof DemandSchema> & IEntity;

export type Offer = Static<typeof OfferSchema> & IEntityV2;

export type Campaign = Static<typeof CampaignSchema> & IEntityV2;

export type CampaignDateProposal = Static<typeof CampaignDateProposalSchema>;

/**
 * DTO
 */
export type DemandDto = Static<typeof DemandDtoSchema>;

export type DemandQueryDto = Static<typeof DemandQuerySchema>;

export type OfferDto = Static<typeof OfferSchema>;

export type OfferQueryDto = Static<typeof OfferQuerySchema>;

export type CampaignDto = Static<typeof CampaignSchema>;

export type CampaignQueryDto = Static<typeof CampaignQuerySchema>;

export type CampaignDateProposalDto = Static<typeof CampaignDateProposalSchema>;
