import { ObjectId } from '@fastify/mongodb';
import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { generateDailyNumber } from '../../common/utils';
import { Cached } from '../../plugins/cache.plugin';
import { HookRepository } from '../hook/hook.repository';
import { WidgetRepository } from '../widget/widget.repository';
import type { PartnerQuery } from './partner.types';
import { PartnerPage, PartnerQueryResponse } from './partner.types';

export class PartnerService {
  private logger = LoggerService.getLogger('partner:service');

  constructor(private readonly hookRepository: HookRepository, private readonly widgetRepository: WidgetRepository) {}

  @Cached('partnerService.aggregateData', { ttl: 60 })
  async aggregateData(query: PartnerQuery): Promise<PartnerQueryResponse> {
    this.logger.info('Aggregating data', { query });

    const widget = await this.widgetRepository.findByWidgetKey(query.widgetKey);
    if (!widget) {
      this.logger.error('Widget not found', { widgetKey: query.widgetKey });
      throw new NotFoundError('Widget not found');
    }

    const partners: PartnerPage[] = await this.queryPartnerPages({ hookId: new ObjectId(widget?.hookId) });
    return { partners } as PartnerQueryResponse;
  }

  private async queryPartnerPages({ hookId }: { hookId: ObjectId }): Promise<PartnerPage[]> {
    // Get today's generated number
    const todayNumber = generateDailyNumber();

    const pipeline = [
      {
        $match: {
          _id: { $ne: hookId },
          status: 'active',
        },
      },
      {
        $sample: { size: 4 },
      },
      {
        $lookup: {
          from: 'widgets',
          localField: '_id',
          foreignField: 'hookId',
          as: 'widgetData',
        },
      },
      {
        $unwind: '$widgetData',
      },
      // Add lookup to count today's visits
      {
        $lookup: {
          from: 'traces', // The collection we're looking up
          let: { let_hookId: '$_id' }, // Define variables to use in the pipeline
          pipeline: [
            // Sub-pipeline to process the traces collection
            {
              $match: {
                $expr: {
                  // Using $expr for variable expressions
                  $and: [
                    { $eq: ['$hookId', '$$let_hookId'] }, // Match documents where hookId equals the current hook's _id. $hookId comes from 'trace' and $$let_hookId comes from 'hook'
                    // Filter for today's date
                    {
                      $gte: ['$createdAt', { $dateFromString: { dateString: new Date().toISOString().split('T')[0] } }],
                    },
                  ],
                },
              },
            },
            { $count: 'count' }, // Count the matching documents and output as {count: N}
          ],
          as: 'visitsToday', // Store the result in visitsToday field
        },
      },
      {
        $addFields: {
          // Convert the ObjectId to a number using its timestamp part
          // The $mod operator calculates the remainder when dividing the long integer by 101
          // This constrains the result to be between 0 and 100 (inclusive)
          idBasedNumber: { $mod: [{ $toLong: { $toDate: '$_id' } }, 101] },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          promoMessage: 1,
          url: '$domain',
          imageUrl: 1,
          widgetKey: '$widgetData.widgetKey',
          todayVisits: {
            $add: [
              {
                $cond: {
                  if: { $gt: [{ $size: '$visitsToday' }, 0] },
                  // Handle case when there are no visits (empty array)
                  then: { $arrayElemAt: ['$visitsToday.count', 0] },
                  else: 0,
                },
              },
              // Add the generated number for today
              todayNumber,
              // Add the idBasedNumber to ensure uniqueness
              '$idBasedNumber',
            ],
          },
        },
      },
    ];

    const partners = await this.hookRepository.aggregate(pipeline);
    return partners as any as PartnerPage[];
  }
}
