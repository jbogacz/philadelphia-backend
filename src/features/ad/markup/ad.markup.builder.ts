import * as esbuild from 'esbuild';
import { join } from 'path';
import { LoggerService } from '../../../common';
import { AdMarkupRequest } from '../ad.types';

export class AdMarkupBuilder {
  private logger = LoggerService.getLogger('features.ad.markup.AdMarkupBuilder');

  async build(markupRequest: AdMarkupRequest): Promise<string> {
    this.logger.info('Building ad markup', markupRequest);

    // Bundle the ad code
    const result = await esbuild.build({
      entryPoints: [join(__dirname, 'ad.code.js')],
      bundle: true,
      write: false,
      format: 'iife',
      globalName: 'AdMarkupCode',
      minify: false,
      target: ['es2015'],
      platform: 'browser',
    });

    if (!result.outputFiles?.[0]?.text) {
      throw new Error('Failed to bundle ad code');
    }

    // TODO: This should be injected from configuration
    const endpoint = process.env.AD_SERVER_ENDPOINT || 'http://localhost:3000';

    // Create the initialization code that will run the ad with the provided config
    const initCode = `
      AdMarkupCode.init(
        '${endpoint}',
        ${JSON.stringify(markupRequest)}
      );
    `;

    // Combine the bundled ad code with the initialization
    return result.outputFiles[0].text + initCode;
  }
}
