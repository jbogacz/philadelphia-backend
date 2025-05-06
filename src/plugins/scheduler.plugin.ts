import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import schedule from '@fastify/schedule';
import { SimpleIntervalJob, Task } from 'toad-scheduler';
import { AppOptions } from '../app.types';

const scheduler: FastifyPluginAsync<AppOptions> = async (fastify, opts) => {
  const { config } = opts;
  void fastify.register(schedule);

  fastify.ready().then(() => {
    const task = new Task('task', () => {
      fastify.log.info('CronJob every 5 seconds');
    });
    const job = new SimpleIntervalJob({ seconds: 1 }, task);

    if (config.scheduler.campaign.enabled) {
      fastify.scheduler.addSimpleIntervalJob(job);
    }
  });
};

export default fp(scheduler);
