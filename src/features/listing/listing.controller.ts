import { FastifyReply, FastifyRequest } from 'fastify';
import { ListingDto, ListingQueryDto, ListingType } from './listing.types';

const mockListings: ListingDto[] = [
  {
    id: '1',
    type: ListingType.OFFER,
    title: 'Tech Blog Traffic',
    author: 'TechMedia Inc.',
    marketType: 'Technology',
    date: '2024-02-01',
    audience: '50k monthly visitors',
    engagement: '3.5% CTR',
    description: 'Offering targeted tech audience with high engagement rates',
  },
  {
    id: '2',
    type: ListingType.DEMAND,
    title: 'Seeking Gaming Audience',
    author: 'GameStart',
    marketType: 'Gaming',
    date: '2024-02-02',
    targetAudience: '18-25 age group',
    budget: '$1000-2000',
    description: 'Looking for gaming enthusiasts for new game launch',
  },
  {
    id: '3',
    type: ListingType.OFFER,
    title: 'Finance Newsletter Audience',
    author: 'FinWatch',
    marketType: 'Finance',
    date: '2024-02-03',
    audience: '25k subscribers',
    engagement: '28% open rate',
    description: 'Highly engaged finance professionals and investors',
  },
  {
    id: '4',
    type: ListingType.OFFER,
    title: 'Finance Newsletter Audience',
    author: 'FinWatch',
    marketType: 'Finance',
    date: '2024-02-03',
    audience: '25k subscribers',
    engagement: '28% open rate',
    description: 'Highly engaged finance professionals and investors',
  },
  {
    id: '5',
    type: ListingType.DEMAND,
    title: 'Health Product Campaign',
    author: 'VitaHealth',
    marketType: 'Health & Wellness',
    date: '2024-02-03',
    targetAudience: 'Health-conscious adults',
    budget: '$3000-5000',
    description: 'Seeking audience for organic supplement launch',
  },
  {
    id: '6',
    type: ListingType.DEMAND,
    title: 'Instagram Fashion Influence',
    author: 'StyleGuide',
    marketType: 'Fashion',
    date: '2024-02-03',
    audience: '100k followers',
    engagement: '4.2% engagement rate',
    description: 'Fashion-forward audience with high purchasing power',
  },
];

export class ListingController {
  async query(request: FastifyRequest<{ Querystring: ListingQueryDto }>, reply: FastifyReply): Promise<ListingDto[]> {
    return reply.code(200).send(mockListings);
  }

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<ListingDto> {
    const listing = mockListings.find((listing) => listing.id === request.params.id);

    if (!listing) {
      return reply.code(404).send();
    }

    return reply.code(200).send(listing);
  }
}
