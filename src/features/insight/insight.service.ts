import { FastifyMongoObject, ObjectId } from '@fastify/mongodb';
import { InsightsOverviewDto, InsightsQueryDto } from './insight.type';
import { TraceType } from '../trace/trace.types';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import { subDays } from 'date-fns/subDays';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { format } from 'date-fns/format';
import { differenceInDays } from 'date-fns/differenceInDays';

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

  async calculateInsights(queryDto: InsightsQueryDto): Promise<InsightsOverviewDto> {
    const query: InsightsQuery = {
      hookId: new ObjectId(queryDto.hookId),
      // Default to 14 days ago ( which is -13 days from today )
      startDate: queryDto.startDate ? startOfDay(new Date(queryDto.startDate)) : startOfDay(subDays(new Date(), 13)),
      endDate: queryDto.endDate ? endOfDay(new Date(queryDto.endDate)) : endOfDay(new Date()),
    };

    const totalVisits = await this.calculateTotalVisits(TraceType.VISIT, query);
    const dailyVisits = await this.calculateDailyVisits(TraceType.VISIT, query);
    const totalPartnerVisits = await this.calculateTotalVisits(TraceType.WIDGET, query);
    const dailyPartnerVisits = await this.calculateDailyVisits(TraceType.WIDGET, query);
    const partnerDistribution = await this.calculatePartnerDistribution(query);

    return {
      summary: {
        direct: {
          visits: totalVisits.visits,
          uniqueVisitors: totalVisits.uniqueVisitors,
          visitsChange: totalVisits.visitsChange,
          uniqueVisitorsChange: totalVisits.uniqueVisitorsChange,
        },
        partner: {
          visits: totalPartnerVisits.visits,
          uniqueVisitors: totalPartnerVisits.uniqueVisitors,
          visitsChange: totalPartnerVisits.visitsChange,
          uniqueVisitorsChange: totalPartnerVisits.uniqueVisitorsChange,
          distribution: partnerDistribution,
        },
      },
      daily: {
        direct: dailyVisits,
        partner: dailyPartnerVisits,
      },
    };
  }

  private async calculateTotalVisits(
    traceType: string,
    query: InsightsQuery
  ): Promise<{ visits: number; uniqueVisitors: number; visitsChange: number; uniqueVisitorsChange: number }> {
    // Calculate the duration in days,
    // +1 to include both start and end dates
    const periodDurationInDays = differenceInDays(query.endDate, query.startDate) + 1;

    // Calculate the previous period
    const prevPeriodEnd = subDays(query.startDate, 1); // One day before current period starts
    const prevPeriodStart = subDays(prevPeriodEnd, periodDurationInDays - 1);

    // Ensure the previous period also has the correct times
    const prevStartDate = startOfDay(prevPeriodStart);
    const prevEndDate = endOfDay(prevPeriodEnd);

    const prevCriteria: MatchCriteria = {
      hookId: { $eq: query.hookId },
      type: { $eq: traceType },
      createdAt: {
        $gte: prevStartDate,
        $lte: prevEndDate,
      },
    };

    const currCriteria: MatchCriteria = {
      hookId: { $eq: query.hookId },
      type: { $eq: traceType },
      createdAt: {
        $gte: query.startDate,
        $lte: query.endDate,
      },
    };

    const [prevResult, currResult] = await Promise.all([this.fetchPeriodVisits(prevCriteria), this.fetchPeriodVisits(currCriteria)]);

    const [currInsight] = currResult || [];
    const [prevInsight] = prevResult || [];
    const currVisits = currInsight?.visits || 0;
    const currUniqueVisitors = currInsight?.uniqueVisitors || 0;
    const prevVisits = prevInsight?.visits || 0;
    const prevUniqueVisitors = prevInsight?.uniqueVisitors || 0;

    // Calculate the percentage change
    const visitsChange = prevVisits === 0 ? 0 : ((currVisits - prevVisits) / prevVisits) * 100;
    const uniqueVisitorsChange = prevUniqueVisitors === 0 ? 0 : ((currUniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100;

    return {
      visits: currVisits,
      uniqueVisitors: currUniqueVisitors,
      visitsChange: Math.round(visitsChange),
      uniqueVisitorsChange: Math.round(uniqueVisitorsChange),
    };
  }

  private async fetchPeriodVisits(periodMatchCriteria: MatchCriteria): Promise<{ visits: number; uniqueVisitors: number }[]> {
    const pipeline = [
      {
        $match: periodMatchCriteria,
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
    const result = this.mongo.db?.collection('traces').aggregate(pipeline).toArray() as Promise<
      { visits: number; uniqueVisitors: number }[]
    >;
    return result;
  }

  private async calculateDailyVisits(
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

    return completeResults;
  }

  private async calculatePartnerDistribution(query: InsightsQuery): Promise<{ name: string; visits: number }[]> {
    const pipeline = [
      {
        $match: {
          hookId: { $eq: query.hookId },
          type: { $eq: TraceType.WIDGET },
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
        },
      },
      {
        $group: {
          _id: '$sourceHookId',
          visits: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'hooks',
          localField: '_id',
          foreignField: '_id',
          as: 'hook',
        },
      },
      {
        $unwind: '$hook',
      },
      {
        $sort: {
          visits: -1,
        },
      },
      {
        $project: {
          _id: 0,
          name: '$hook.name',
          visits: 1,
        },
      },
    ];
    return ((await this.mongo.db?.collection('traces').aggregate(pipeline).toArray()) as { name: string; visits: number }[]) || [];
  }
}
