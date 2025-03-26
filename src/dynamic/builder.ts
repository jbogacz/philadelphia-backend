import * as esbuild from 'esbuild';

import { DynamicBlueprint, DynamicConfig } from './types';
import { join } from 'path';

export class DynamicBuilder<T extends DynamicBlueprint, U extends DynamicConfig> {
  constructor(private readonly dynamicCodeName: string, private readonly dynamicDirname: string) {}

  async build(blueprint: T, config: U): Promise<string> {
    // Bundle the ad code
    const result = await esbuild.build({
      entryPoints: [join(this.dynamicDirname, this.dynamicCodeName + '.code.js')],
      bundle: true,
      write: false,
      format: 'iife',
      globalName: this.dynamicCodeName + 'DynamicCode',
      minify: false,
      target: ['es2020'],
      platform: 'browser',
    });

    if (!result.outputFiles?.[0]?.text) {
      throw new Error('Failed to bundle dynamic code');
    }

    // Prevent the dynamic code from being loaded multiple times
    const code = `
      if (!window.__${this.dynamicCodeName.replace('.', '')}Loaded_449d04dc8f372e8318c74dec02e99000) {
        ${this.dynamicCodeName + 'DynamicCode'}.load(
          ${JSON.stringify(blueprint)},
          ${JSON.stringify(config)}
        );
        window.__${this.dynamicCodeName.replace('.', '')}Loaded_449d04dc8f372e8318c74dec02e99000 = true;
      }
    `;

    return result.outputFiles[0].text + code;
  }
}
