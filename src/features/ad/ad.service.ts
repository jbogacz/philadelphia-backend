import esbuild from 'esbuild';
import { createAdMarkup } from './ad.markup.js';

export class AdService {
  async produceAdMarkup(): Promise<string> {
    try {
      const adCode = createAdMarkup({
        targetId: 'ad-container',
        customUrl: 'https://example.com'
      });

      const result = await esbuild.transform(adCode, {
        minify: true,
        format: 'iife',
        target: 'es2015'
      });

      return result.code;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
