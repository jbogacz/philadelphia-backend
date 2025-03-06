export const randomId = (): string => Math.random().toString(36).substring(2, 9);

export const clearEnvCache = () => {
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });
  require('dotenv').config();
};
