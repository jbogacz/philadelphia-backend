import { createHash } from 'crypto';

export const randomId = (): string => Math.random().toString(36).substring(2, 9);

export const clearEnvCache = () => {
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });
  require('dotenv').config();
};

export function computeHashKey(obj: object): string {
  // Direct JSON stringify without sorting
  const jsonString = JSON.stringify(obj);
  // Create a hash of the JSON string
  return createHash('md5').update(jsonString).digest('hex');
}

export function is24Hex(str: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(str);
}

/**
 * Generates a consistent number between min and max (inclusive) for a particular day
 * @param min The minimum value (default: 50)
 * @param max The maximum value (default: 100)
 * @param date Optional date object (defaults to current date)
 * @returns A number between min and max that will be consistent for the same day
 */
export function generateDailyNumber(min: number = 50, max: number = 100, date: Date = new Date()): number {
  // Extract year, month and day from the date
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate(); // 1-31

  // Create a seed value using the date components
  // Use a simple hash function to convert the date into a number
  const seed = year * 10000 + month * 100 + day;

  // Use the seed to generate a number between 0 and 1
  // This is a simple pseudo-random number generator that will always
  // produce the same output for the same input
  const seedRandom = ((seed * 9301 + 49297) % 233280) / 233280;

  // Scale the random number to be between min and max (inclusive)
  return Math.floor(seedRandom * (max - min + 1)) + min;
}
