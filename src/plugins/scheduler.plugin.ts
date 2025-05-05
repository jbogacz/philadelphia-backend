import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import schedule from '@fastify/schedule';
import { CronJob, SimpleIntervalJob, Task } from 'toad-scheduler';

const scheduler: FastifyPluginAsync = async (fastify) => {
  void fastify.register(schedule);

  fastify.ready().then(() => {
    const task = new Task('task', () => {
      fastify.log.info('CronJob every 5 seconds');
    });
    const job = new SimpleIntervalJob({ seconds: 5 }, task);

    fastify.scheduler.addSimpleIntervalJob(job);
  });
};

export default fp(scheduler);
