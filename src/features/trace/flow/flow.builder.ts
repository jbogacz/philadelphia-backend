import * as esbuild from 'esbuild';

import { join } from 'path';
import { LoggerService } from '../../../common';
import { FlowBlueprint, FlowConfig } from './flow.types';

export class FlowBuilder {
  private logger = LoggerService.getLogger('feature.flow.FlowBuilder');

  async build(blueprint: FlowBlueprint, config: FlowConfig): Promise<string> {
    this.logger.info('Building flow code');
    
    // Bundle the ad code
    const result = await esbuild.build({
      entryPoints: [join(__dirname, 'flow.code.js')],
      bundle: true,
      write: false,
      format: 'iife',
      globalName: 'FlowCode',
      minify: false,
      target: ['es2015'],
      platform: 'browser',
    });

    if (!result.outputFiles?.[0]?.text) {
      throw new Error('Failed to bundle dynamic code');
    }

    const code = `
      FlowCode.load(
        ${JSON.stringify(blueprint)},
        ${JSON.stringify(config)}
      );
    `;

    return result.outputFiles[0].text + code;
  }
}
