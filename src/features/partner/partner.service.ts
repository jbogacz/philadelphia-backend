import { ObjectId } from '@fastify/mongodb';
import { HookRepository } from '../hook/hook.repository';
import { TraceRepository } from '../trace/trace.repository';
import { PartnerPage, PartnerQuery, PartnerQueryResponse } from './partner.types';
import { generateDailyNumber } from '../../common/utils';

export class PartnerService {
  constructor(private readonly hookRepository: HookRepository, private readonly traceRepository: TraceRepository) {}

  async aggregateData(query: PartnerQuery): Promise<PartnerQueryResponse> {
    const hookId = new ObjectId(query.hookId);
    const partners: PartnerPage[] = await this.queryPartnerPages({ hookId });
    return { partners } as PartnerQueryResponse;
  }

  private async queryPartnerPages({ hookId }: { hookId: ObjectId }): Promise<PartnerPage[]> {
    // Get today's generated number
    const todayNumber = generateDailyNumber();

    const pipeline = [
      {
        $match: {
          _id: { $ne: hookId },
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
