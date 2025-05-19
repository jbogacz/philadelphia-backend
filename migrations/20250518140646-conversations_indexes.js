module.exports = {
  async up(db, client) {
    await db.collection('conversations').createIndex({ campaignId: 1 }, { name: 'idx_campaign_id' });
  },

  async down(db, client) {
    await db.collection('conversations').dropIndex('idx_campaign_id');
  },
};
