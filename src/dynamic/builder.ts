import * as esbuild from 'esbuild';

import { LoggerService } from '../common';
import { DynamicBlueprint, DynamicConfig } from './types';
import { join } from 'path';

export class DynamicBuilder<T extends DynamicBlueprint, U extends DynamicConfig> {
  private logger = LoggerService.getLogger('dynamic.DynamicCodeBuilder');

  constructor(private readonly dynamicDirname: string) {}

  async build(blueprint: T, config: U): Promise<string> {
    this.logger.info('Building dynamic code: ' + config.name);

    const dynamicCodeName = config.name;

    // Bundle the ad code
    const result = await esbuild.build({
      entryPoints: [join(this.dynamicDirname, dynamicCodeName + '.code.js')],
      bundle: true,
      write: false,
      format: 'iife',
      globalName: dynamicCodeName + 'DynamicCode',
      minify: false,
      target: ['es2015'],
      platform: 'browser',
    });

    if (!result.outputFiles?.[0]?.text) {
      throw new Error('Failed to bundle dynamic code');
    }

    const code = `
      ${dynamicCodeName + 'DynamicCode'}.load(
        ${JSON.stringify(blueprint)},
        ${JSON.stringify(config)}
      );
    `;

    return result.outputFiles[0].text + code;
  }
}
