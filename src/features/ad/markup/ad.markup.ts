import * as esbuild from 'esbuild';
import { join } from 'path';
import { AdRequest } from './ad.markup.types';

export async function createAdMarkup(adRequest: AdRequest): Promise<string> {
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

  // Create the initialization code that will run the ad with the provided config
  const initCode = `
    AdInitializer.initializeAd({
      targetId: '${adRequest.targetId}',
      fingerprintId: '${adRequest.fingerprintId}'
    });
  `;

  // Combine the bundled ad code with the initialization
  return result.outputFiles[0].text + initCode;
}
