import { ObjectId } from '@fastify/mongodb';
import { Campaign, CampaignStatus } from '../src/features/marketplace/marketplace.types';
import { Widget, WidgetStatus } from '../src/features/widget/widget.types';

function createCampaign(startDate: Date, endDate: Date, status: CampaignStatus): Campaign {
  return {
    demandId: new ObjectId(),
    offerId: new ObjectId(),
    hookId: new ObjectId(),
    providerId: 'providerId',
    seekerId: 'seekerId',
    goal: 1000,
    price: 900,
    duration: 30,
    trafficSources: 'source1,source2',
    trackingUrl: 'https://example.com/tracking',
    title: 'Campaign Title',
    destinationUrl: 'https://example.com',
    utmCampaign: 'utm_campaign-' + new Date().getTime(),
    startDate: startDate,
    endDate: endDate,
    status: status,
  };
}

function createWidget(hookId: ObjectId): Widget {
  return {
    status: WidgetStatus.ACTIVE,
    widgetKey: 'widgetKey',
    userId: 'seekerId',
    code: 'widgetCode',
    position: 'bottom-right',
    color: '#FF5733',
    enabled: true,
    hookId: hookId,
  } as any;
}

export { createCampaign, createWidget };
