require('./dist/common/utils.js').clearEnvCache();

const config = {
  mongodb: {
    url: process.env.MONGODB_URL,
    databaseName: process.env.MONGODB_DATABASE,

    options: {},
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  lockCollectionName: 'changelog_lock',
  // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
  lockTtl: 0,
  migrationFileExtension: '.js',
  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,
  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;
