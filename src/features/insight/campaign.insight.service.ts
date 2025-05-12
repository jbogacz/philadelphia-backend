import { startOfDay } from 'date-fns/startOfDay';
import { NotFoundError } from '../../common/errors';
import { CampaignRepository } from '../marketplace/campaign/campaign.repository';
import { TraceRepository } from '../trace/trace.repository';
import { TraceType } from '../trace/trace.types';
import { CampaignInsightDto, CampaignInsightsQueryDto } from './insight.type';
import { endOfDay } from 'date-fns/endOfDay';

export class CampaignInsightService {
  constructor(private readonly campaignRepository: CampaignRepository, private readonly traceRepository: TraceRepository) {}

  async calculateInsights(query: CampaignInsightsQueryDto): Promise<CampaignInsightDto> {
    const campaign = await this.campaignRepository.findById(query.campaignId);
    if (!campaign) {
      throw new NotFoundError(`Campaign with id ${query.campaignId} not found`);
    }
    const dailyVisitsPipeline = [
      {
        $match: {
          campaignId: campaign._id,
          type: TraceType.FLOW,
          createdAt: {
            $gte: startOfDay(campaign.startDate!),
            $lte: endOfDay(campaign.endDate!),
          },
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $toDate: '$createdAt' },
            },
          },
        },
      },
      {
        $group: {
          _id: '$date',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$fingerprint.fingerprintId' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          uniqueVisitors: { $size: '$uniqueVisitors' },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];

    const dailyVisits: {
      date: string;
      uniqueVisitors: number;
    }[] = await this.traceRepository.aggregate(dailyVisitsPipeline);

    const summary: CampaignInsightDto = {
      campaignId: campaign._id,
      daily: dailyVisits,
      summary: {
        uniqueVisitors: dailyVisits.reduce((acc, curr) => acc + curr.uniqueVisitors, 0),
      },
    };
    return summary;
  }
}
