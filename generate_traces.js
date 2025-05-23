// MongoDB Traces Test Data Generator
const crypto = require('crypto');

function generateObjectId() {
  return new Array(24).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateFingerprintId() {
  return crypto.createHash('md5').update(Math.random().toString()).digest('hex');
}

function generateTraceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate test data
function generateTraces() {
  const traces = [];

  // Fixed values (as requested)
  const CAMPAIGN_ID = "CAMPAIGN_ID";
  const HOOK_ID = "HOOK_ID";
  const WIDGET_ID = "WIDGET_ID";
  const WIDGET_KEY = "WIDGET_KEY";
  const UTM_CAMPAIGN = "UTM_CAMPAIGN";

  // Date range: Last 7 days
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

  // Generate unique fingerprints (representing unique visitors)
  const fingerprints = [];
  for (let i = 0; i < 450; i++) {
    fingerprints.push(generateFingerprintId());
  }

  // Generate 700 trace records
  for (let i = 0; i < 700; i++) {
    // Randomly select from our 1000 unique fingerprints
    const fingerprintId = fingerprints[Math.floor(Math.random() * fingerprints.length)];

    // Generate random date within the week
    const createdAt = generateRandomDate(oneWeekAgo, now);

    const trace = {
      "_id": {
        "$oid": generateObjectId()
      },
      "campaignId": {
        "$oid": CAMPAIGN_ID
      },
      "createdAt": {
        "$date": createdAt.toISOString()
      },
      "fingerprint": {
        "fingerprintId": fingerprintId
      },
      "hookId": {
        "$oid": HOOK_ID
      },
      "traceId": generateTraceId(),
      "type": "flow",
      "updatedAt": {
        "$date": createdAt.toISOString()
      },
      "utmCampaign": UTM_CAMPAIGN,
      "widgetId": {
        "$oid": WIDGET_ID
      },
      "widgetKey": WIDGET_KEY
    };

    traces.push(trace);
  }

  return traces;
}

// Generate the data
const testTraces = generateTraces();

// Output as JSON (you can also write to file)
console.log(JSON.stringify(testTraces, null, 2));

// If you want to save to file (uncomment the following lines):
const fs = require('fs');
fs.writeFileSync('traces_test_data.json', JSON.stringify(testTraces, null, 2));
// console.log('Test data saved to traces_test_data.json');

// Some statistics about the generated data
console.log('\n--- Statistics ---');
console.log(`Total traces: ${testTraces.length}`);
console.log(`Unique fingerprints: ${new Set(testTraces.map(t => t.fingerprint.fingerprintId)).size}`);
console.log(`Date range: ${testTraces[0].createdAt.$date} to ${testTraces[testTraces.length-1].createdAt.$date}`);
