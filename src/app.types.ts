import { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyServerOptions } from 'fastify';

export interface AppConfig {
  apiUrl: string;
  isProduction: () => boolean;
  isDevelopment: () => boolean;

}

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
  env?: string;
  config: AppConfig;
  mongodb: {
    url: string;
    database: string;
    auth?: {
      username: string;
      password: string;
    };
  };
  seedDemoData: boolean;
}
