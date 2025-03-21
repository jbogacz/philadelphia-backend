const { ObjectId } = require('mongodb');

module.exports = {
  async up(db, client) {
    const hooks = await db
      .collection('hooks')
      .find({ widgetId: { $type: 'string' } })
      .toArray();

    for (const hook of hooks) {
      if (hook.widgetId && ObjectId.isValid(hook.widgetId)) {
        await db.collection('hooks').updateOne({ _id: hook._id }, { $set: { widgetId: new ObjectId(hook.widgetId) } });
      }
    }
  },

  async down(db, client) {
    const hooks = await db
      .collection('hooks')
      .find({ widgetId: { $type: 'objectId' } })
      .toArray();

    for (const hook of hooks) {
      if (hook.widgetId) {
        await db.collection('hooks').updateOne({ _id: hook._id }, { $set: { widgetId: hook.widgetId.toString() } });
      }
    }
  },
};
