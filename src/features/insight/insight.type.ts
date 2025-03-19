import { Static, Type } from '@sinclair/typebox';

/**
 * SCHEMA
 */
export const InsightsQuerySchema = Type.Object({
  hookId: Type.String(),
  startDate: Type.Optional(Type.String({ format: 'date', description: 'Format: yyyy-mm-dd' })),
  endDate: Type.Optional(Type.String({ format: 'date', description: 'Format: yyyy-mm-dd' })),
});

export const InsightsOverviewSchema = Type.Object({
  summary: Type.Object({
    direct: Type.Object({
      visits: Type.Number(),
      uniqueVisitors: Type.Number(),
      visitsChange: Type.Number(),
      uniqueVisitorsChange: Type.Number(),
    }),
    partner: Type.Object({
      visits: Type.Number(),
      uniqueVisitors: Type.Number(),
      visitsChange: Type.Number(),
      uniqueVisitorsChange: Type.Number(),
      distribution: Type.Array(
        Type.Object({
          name: Type.String(),
          percentage: Type.Number(),
        })
      ),
    }),
  }),
  daily: Type.Object({
    direct: Type.Array(
      Type.Object({
        date: Type.String(),
        visits: Type.Number(),
        uniqueVisitors: Type.Number(),
      })
    ),
    partner: Type.Array(
      Type.Object({
        date: Type.String(),
        visits: Type.Number(),
        uniqueVisitors: Type.Number(),
      })
    ),
  }),
});

/**
 * DTO
 */
export type InsightsQueryDto = Static<typeof InsightsQuerySchema>;

export type InsightsOverviewDto = Static<typeof InsightsOverviewSchema>;
