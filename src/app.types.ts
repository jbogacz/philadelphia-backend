import { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyServerOptions } from "fastify";

export interface AppConfig {
  trace: {
    apiUrl: string;
  };
  impression: {
    apiUrl: string;
  };
}

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
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
