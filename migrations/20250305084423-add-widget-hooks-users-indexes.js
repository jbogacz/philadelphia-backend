module.exports = {
  async up(db, client) {
    await db.collection('users').createIndex({ userId: 1 }, { unique: true });
    await db.collection('hooks').createIndex({ widgetId: 1 }, { unique: true });
    await db.collection('widgets').createIndex({ hookId: 1 }, { unique: true });
  },

  async down(db, client) {
    await db.collection('users').dropIndex('userId_1');
    await db.collection('hooks').dropIndex('widgetId_1');
    await db.collection('widgets').dropIndex('hookId_1');
  }
};
