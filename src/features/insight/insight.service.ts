import { FastifyMongoObject, ObjectId } from '@fastify/mongodb';
import { InsightsOverviewDto, InsightsQueryDto } from './insight.type';
import { TraceType } from '../trace/trace.types';
import { startOfDay, subDays, endOfDay, eachDayOfInterval, format } from 'date-fns';

interface MatchCriteria {
  hookId: { $eq: ObjectId };
  type: { $eq: string };
  createdAt: {
    $gte: Date;
    $lte: Date;
  };
}

interface InsightsQuery {
  hookId: ObjectId;
  startDate: Date;
  endDate: Date;
}

export class InsightService {
  constructor(private readonly mongo: FastifyMongoObject) {}

  async fetchInsights(queryDto: InsightsQueryDto): Promise<InsightsOverviewDto> {
    const query: InsightsQuery = {
      hookId: new ObjectId(queryDto.hookId),
      startDate: queryDto.startDate ? startOfDay(new Date(queryDto.startDate)) : startOfDay(subDays(new Date(), 13)), // Default to 14 days ago
      endDate: queryDto.endDate ? endOfDay(new Date(queryDto.endDate)) : endOfDay(new Date()),
    };

    const totalVisits = await this.fetchTotalVisits(TraceType.VISIT, query);
    const dailyVisits = await this.fetchDailyVisits(TraceType.VISIT, query);
    const totalPartnerVisits = await this.fetchTotalVisits(TraceType.WIDGET, query);
    const dailyPartnerVisits = await this.fetchDailyVisits(TraceType.WIDGET, query);

    return {
      summary: {
        direct: {
          visits: totalVisits.visits,
          uniqueVisitors: totalVisits.uniqueVisitors,
        },
        partner: {
          visits: totalPartnerVisits.visits,
          uniqueVisitors: totalPartnerVisits.uniqueVisitors,
        },
      },
      daily: {
        direct: dailyVisits,
        partner: dailyPartnerVisits,
      },
    };
  }

  private async fetchTotalVisits(traceType: string, query: InsightsQuery): Promise<{ visits: number; uniqueVisitors: number }> {
    const matchCriteria: MatchCriteria = {
      hookId: { $eq: query.hookId },
      type: { $eq: traceType },
      createdAt: {
        $gte: query.startDate,
        $lte: query.endDate,
      },
    };

    const pipeline = [
      {
        $match: matchCriteria,
      },
      {
        $group: {
          _id: null,
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$fingerprint.fingerprintId' },
        },
      },
      {
        $project: {
          _id: 0,
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
        },
      },
    ];
    const result = await this.mongo.db?.collection('traces').aggregate(pipeline).toArray();

    const [insight] = result || [];
    return {
      visits: insight?.visits || 0,
      uniqueVisitors: insight?.uniqueVisitors || 0,
    };
  }

  private async fetchDailyVisits(
    traceType: string,
    query: InsightsQuery
  ): Promise<{ date: string; visits: number; uniqueVisitors: number }[]> {
    const matchCriteria: MatchCriteria = {
      hookId: { $eq: query.hookId },
      type: { $eq: traceType },
      createdAt: {
        $gte: query.startDate,
        $lte: query.endDate,
      },
    };

    const pipeline = [
      {
        $match: matchCriteria,
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
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];

    const result = (await this.mongo.db?.collection('traces').aggregate(pipeline).toArray()) || [];

    // Generate all dates in range using date-fns with your format
    const allDates = eachDayOfInterval({ start: query.startDate, end: query.endDate }).map((date) => format(date, 'yyyy-MM-dd'));

    // Create a map of existing results
    const resultsMap = new Map();
    result.forEach((item) => {
      resultsMap.set(item.date, item);
    });

    // Fill in missing dates with zero values
    const completeResults = allDates.map((date) => {
      return resultsMap.get(date) || { date, visits: 0, uniqueVisitors: 0 };
    });

    // return (result as { date: string; visits: number; uniqueVisitors: number }[]) || [];
    return completeResults;
  }
}
