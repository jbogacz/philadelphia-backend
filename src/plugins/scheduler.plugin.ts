import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import schedule from '@fastify/schedule';
import { CronJob, SimpleIntervalJob, Task } from 'toad-scheduler';
import { AppOptions } from '../app.types';
import { CampaignSchedulerService } from '../features/marketplace/campaign/campaign.scheduler.service';

const scheduler: FastifyPluginAsync<AppOptions> = async (fastify, opts) => {
  const { config } = opts;
  void fastify.register(schedule);

  fastify.ready().then(() => {
    // Scheduler for campaign activation and completion
    if (config.scheduler.campaign.enabled) {
      if (config.scheduler.campaign.cron === '') {
        fastify.log.error('Campaign scheduler cron expression is empty');
        return;
      }

      const cronSchedule = {
        cronExpression: config.scheduler.campaign.cron,
      };

      const task = new Task('processCampaignsTask', async () => {
        const campaignService = new CampaignSchedulerService(fastify.repository.campaign);
        await campaignService.activateCampaigns();
        await campaignService.completeCampaigns();
      });
      const job = new CronJob(cronSchedule, task);

      fastify.scheduler.addCronJob(job);
    }
  });
};

export default fp(scheduler);
