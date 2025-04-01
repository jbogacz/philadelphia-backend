import { FastifyReply, FastifyRequest } from 'fastify';
import { PartnerQuery, PartnerQueryResponse } from './partner.types';
import { ErrorDto } from '../../common/errors';
import { PartnerService } from './partner.service';

export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  async query(
    request: FastifyRequest<{ Querystring: PartnerQuery }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: PartnerQueryResponse | ErrorDto;
    }>
  > {
    const response = await this.partnerService.aggregateData(request.query);
    return reply.code(200).send(response);
  }
}
