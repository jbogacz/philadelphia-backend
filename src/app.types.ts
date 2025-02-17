import { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyServerOptions } from "fastify";
import { ClientOptions } from "minio";

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
