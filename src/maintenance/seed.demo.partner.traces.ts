import { FastifyInstance } from 'fastify';
import { Trace, TraceType, WidgetTrace } from '../features/trace/trace.types';
import { ObjectId } from '@fastify/mongodb';

interface TraceOptions {
  date: Date;
  traceId: string;
  hookId: ObjectId;
  widgetId: ObjectId;
  widgetKey: string;
  sourceHookId: ObjectId;
  sourceWidgetId: ObjectId;
  sourceWidgetKey: string;
}

export const seedDemoPartnerTraces = async (fastify: FastifyInstance): Promise<void> => {
  await persistTrace(
    {
      date: new Date(),
      traceId: 'de621f0a-b5b2-4513-a51d-b3ef7feb8bce',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d007b53d35381340f68c7c'),
      sourceWidgetId: new ObjectId('67d0056e3d35381340f68c7b'),
      sourceWidgetKey: '6696007f-86aa-46f2-a6f1-05d2dc9d7c1b',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: '7a8b3c9d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d007b53d35381340f68c7c'),
      sourceWidgetId: new ObjectId('67d0056e3d35381340f68c7b'),
      sourceWidgetKey: '6696007f-86aa-46f2-a6f1-05d2dc9d7c1b',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: '9f2e8d7c-6b5a-4321-9876-543210fedcba',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d007b53d35381340f68c7c'),
      sourceWidgetId: new ObjectId('67d0056e3d35381340f68c7b'),
      sourceWidgetKey: '6696007f-86aa-46f2-a6f1-05d2dc9d7c1b',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d007b53d35381340f68c7c'),
      sourceWidgetId: new ObjectId('67d0056e3d35381340f68c7b'),
      sourceWidgetKey: '6696007f-86aa-46f2-a6f1-05d2dc9d7c1b',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: 'abcdef12-3456-7890-abcd-1234567890ab',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d007b53d35381340f68c7c'),
      sourceWidgetId: new ObjectId('67d0056e3d35381340f68c7b'),
      sourceWidgetKey: '6696007f-86aa-46f2-a6f1-05d2dc9d7c1b',
    },
    fastify
  );

  await persistTrace(
    {
      date: new Date(),
      traceId: '12345678-9abc-def0-1234-56789abcdef0',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d17d9f5b6f2ff5cfcbff2a'),
      sourceWidgetId: new ObjectId('67d17b0f5b6f2ff5cfcbff29'),
      sourceWidgetKey: '973ae883-9b4c-4725-9f0b-cafbcb16f947',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: 'fedcba98-7654-3210-fedc-ba9876543210',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d17d9f5b6f2ff5cfcbff2a'),
      sourceWidgetId: new ObjectId('67d17b0f5b6f2ff5cfcbff29'),
      sourceWidgetKey: '973ae883-9b4c-4725-9f0b-cafbcb16f947',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67d17d9f5b6f2ff5cfcbff2a'),
      sourceWidgetId: new ObjectId('67d17b0f5b6f2ff5cfcbff29'),
      sourceWidgetKey: '973ae883-9b4c-4725-9f0b-cafbcb16f947',
    },
    fastify
  );

  await persistTrace(
    {
      date: new Date(),
      traceId: 'd7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67c9634e69bc111933f0d4e5'),
      sourceWidgetId: new ObjectId('67c9634e69bc111933f0d4e4'),
      sourceWidgetKey: '37191045-c774-4c5d-8138-47784134df07',
    },
    fastify
  );
  await persistTrace(
    {
      date: new Date(),
      traceId: '23f45a67-89bc-def0-1234-5678901a2b3c',
      hookId: new ObjectId('67c5eaef6b8a40bfa6836ed7'),
      widgetId: new ObjectId('67c5eaa96b8a40bfa6836ed6'),
      widgetKey: '000d5f62-11c5-408d-a464-77c570fdd6da',
      sourceHookId: new ObjectId('67c9634e69bc111933f0d4e5'),
      sourceWidgetId: new ObjectId('67c9634e69bc111933f0d4e4'),
      sourceWidgetKey: '37191045-c774-4c5d-8138-47784134df07',
    },
    fastify
  );
};

const persistTrace = async (options: TraceOptions, fastify: FastifyInstance): Promise<void> => {
  const trace = {
    createdAt: options.date,
    fingerprint: {
      fingerprintId: '514aa23cf51f3e8100a656950c3e73f1',
    },
    geo: {
      ip: '185.241.196.6',
      city: '111ruszcz Gdanski',
      postal: '83',
      region: 'Pomeranian Voivodeship',
      country: 'Poland',
      latitude: 54.26215,
      longitude: 18.63617,
      timezone: 'Europe/Warsaw',
      currentTime: '2025-03-20 09:54:32.932+0100',
      isp: 'Adam Dlugosz trading as ABAKS',
    },
    hookId: options.hookId,
    sourceHookId: options.sourceHookId,
    sourceWidgetId: options.sourceWidgetId,
    sourceWidgetKey: options.sourceWidgetKey,
    traceId: options.traceId,
    type: TraceType.WIDGET,
    updatedAt: options.date,
    widgetId: options.widgetId,
    widgetKey: options.widgetKey,
  };

  const existingTrace = await fastify.mongo?.db?.collection<WidgetTrace>('traces').findOne({ traceId: options.traceId });
  if (!existingTrace) {
    await fastify.mongo?.db?.collection<WidgetTrace>('traces').insertOne(trace as any);
    console.log('Seeded trace:', JSON.stringify(trace));
  }
};
