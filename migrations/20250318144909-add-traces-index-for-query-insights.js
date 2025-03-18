module.exports = {
  async up(db, client) {
    await db.collection('traces').createIndex(
      {
        hookId: 1,
        type: 1,
        createdAt: 1,
      },
      { name: 'idx_hook_type_date' }
    );
  },

  async down(db, client) {
    await db.collection('traces').dropIndex('idx_hook_type_date');
  },
};
