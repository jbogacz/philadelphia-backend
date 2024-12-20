import { AdService } from './ad.service';
import * as esbuild from 'esbuild';

export class AdController {
  constructor(private adService: AdService) {}

  //@ts-ignore
  getAdMarkup = (request, reply) => {
    const result = this.adService.produceAdMarkup();
    return result;
  };
}
