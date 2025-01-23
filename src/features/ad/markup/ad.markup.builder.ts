import * as esbuild from 'esbuild';
import { join } from 'path';
import { LoggerService } from '../../../common';
import { AdMarkupConfig, AdMarkupBlueprint } from '../ad.types';

export class AdMarkupBuilder {
  private logger = LoggerService.getLogger('features.ad.markup.AdMarkupBuilder');

  async build(markupBlueprint: AdMarkupBlueprint, markupConfig: AdMarkupConfig): Promise<string> {
    this.logger.info('Building ad markup', { config: markupConfig, blueprint: markupBlueprint });

    // Bundle the ad code
    const result = await esbuild.build({
      entryPoints: [join(__dirname, 'ad.markup.code.js')],
      bundle: true,
      write: false,
      format: 'iife',
      globalName: 'AdMarkupCode',
      minify: false,
      target: ['es2015'],
      platform: 'browser',
    });

    if (!result.outputFiles?.[0]?.text) {
      throw new Error('Failed to bundle dynamic code');
    }

    // Create the initialization code that will run the ad with the provided config
    const code = `
      AdMarkupCode.load(
        ${JSON.stringify(markupBlueprint)},
        ${JSON.stringify(markupConfig)}
      );
    `;

    // Combine the bundled ad code with the initialization
    return result.outputFiles[0].text + code;
  }
}
