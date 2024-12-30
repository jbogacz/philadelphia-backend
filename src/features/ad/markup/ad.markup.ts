import * as esbuild from 'esbuild';
import { join } from 'path';
import { LoggerService } from '../../../common';
import { AdRequest } from '../ad.types';

export class MarkupBuilder {
  private logger = LoggerService.getLogger('features.ad.markup.MarkupBuilder');

  async build(adRequest: AdRequest): Promise<string> {
    this.logger.info('Building ad markup', adRequest);

    // Bundle the ad code
    const result = await esbuild.build({
      entryPoints: [join(__dirname, 'ad.markup.code.js')],
      bundle: true,
      write: false,
      format: 'iife',
      globalName: 'AdInitializer',
      minify: false,
      target: ['es2015'],
      platform: 'browser',
    });

    if (!result.outputFiles?.[0]?.text) {
      throw new Error('Failed to bundle ad code');
    }

    const endpoint = process.env.AD_SERVER_ENDPOINT || 'http://localhost:3000';

    // Create the initialization code that will run the ad with the provided config
    const initCode = `
      AdInitializer.initialize(
        '${endpoint}',
        ${JSON.stringify(adRequest)});
    `;

    // Combine the bundled ad code with the initialization
    return result.outputFiles[0].text + initCode;
  }
}
