import { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyServerOptions } from "fastify";

export interface AppConfig {
  trace: {
    apiUrl: string;
  };
  impression: {
    apiUrl: string;
  };
  flow: {
    apiUrl: string;
  };
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
}
