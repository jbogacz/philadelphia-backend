// Core Analytics Class
class Analytics {
  constructor(config = {}) {
    this.config = {
      apiHost: config.apiHost || 'https://anl.leadoo.com/t',
      companyCode: config.companyCode,
      companyID: config.companyID,
      gtm: config.gtm || '',
      gtmDataLayer: config.gtmDataLayer || 'dataLayer',
      identityAPIURL: config.identityAPIURL || 'https://anl.leadoo.com/idn',
      consentSetting: config.consentSetting || 1, // Default to requiring consent
      companyTrackingOverride: config.companyTrackingOverride || false,
      websiteTrackingMode: config.websiteTrackingMode || 0,
      memoryMode: config.memoryMode || 0
    };

    // Internal state
    this.state = {
      userTrackingEnabled: false,
      companyTrackingEnabled: false,
      pageVisitID: null,
      sessionID: null,
      queuedEvents: [],
      trackedCompany: null,
      trackedUser: null
    };

    // Initialize event queue
    this.eventQueue = new EventQueue();
  }

  // User Tracking Methods
  async trackUser() {
    if (!this.state.userTrackingEnabled) {
      console.debug('User tracking disabled');
      return;
    }

    if (this.state.trackedUser) {
      return;
    }

    try {
      const deviceId = await this.getOrCreateDeviceId();
      this.state.trackedUser = true;
      await this.emit('userIdentified', deviceId);
      console.debug(`User tracked with device ID: ${deviceId}`);
    } catch (error) {
      console.error('Failed to track user:', error);
    }
  }

  // Event Tracking
  async trackEvent(eventName, properties = {}) {
    if (!this.isTrackingEnabled()) {
      this.queueEvent(eventName, properties);
      return;
    }

    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        pageVisitId: this.state.pageVisitID,
        sessionId: this.state.sessionID,
        deviceId: await this.getDeviceId(),
        companyId: this.config.companyID
      }
    };

    await this.sendEvent(event);
  }

  // Page Visit Tracking
  async trackPageVisit() {
    const url = window.location.href;
    const referrer = document.referrer;

    const pageVisit = {
      url,
      referrer,
      timestamp: Date.now(),
      utm: this.getUTMParameters(),
      sessionId: this.state.sessionID
    };

    await this.trackEvent('page_visit', pageVisit);
  }

  // Company Tracking
  async trackCompany() {
    if (!this.state.companyTrackingEnabled) {
      return;
    }

    if (this.state.trackedCompany) {
      return;
    }

    try {
      const companyInfo = await this.fetchCompanyInfo(this.config.companyCode);
      if (companyInfo) {
        this.state.trackedCompany = true;
        await this.emit('companyIdentified', companyInfo);
      }
    } catch (error) {
      console.error('Failed to track company:', error);
    }
  }

  // Consent Management
  initializeConsent() {
    switch (this.config.consentSetting) {
      case ConsentMode.Always:
        this.enableTracking(true);
        break;
      case ConsentMode.Never:
        this.enableTracking(false);
        break;
      case ConsentMode.CMP:
        this.initializeCMPConsent();
        break;
      default:
        this.initializeStandardConsent();
    }
  }

  // GTM Integration
  initializeGTM() {
    if (!this.config.gtm) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.config.gtm}`;
    document.body.appendChild(script);

    window[this.config.gtmDataLayer] = window[this.config.gtmDataLayer] || [];
  }

  async sendGTMEvent(eventName, properties = {}) {
    if (!this.config.gtm) {
      return;
    }

    window[this.config.gtmDataLayer].push({
      event: eventName,
      ...properties
    });
  }

  // Utility Methods
  isTrackingEnabled() {
    return this.state.userTrackingEnabled || this.state.companyTrackingEnabled;
  }

  enableTracking(enabled) {
    this.state.userTrackingEnabled = enabled;
    this.state.companyTrackingEnabled = enabled;

    if (enabled) {
      this.processQueuedEvents();
    }
  }

  getUTMParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      term: params.get('utm_term'),
      content: params.get('utm_content')
    };
  }

  // Event Queue Management
  queueEvent(eventName, properties) {
    this.state.queuedEvents.push({ eventName, properties });
  }

  async processQueuedEvents() {
    while (this.state.queuedEvents.length > 0) {
      const event = this.state.queuedEvents.shift();
      await this.trackEvent(event.eventName, event.properties);
    }
  }
}

// Helper Classes
class EventQueue {
  constructor() {
    this.queues = new Map();
  }

  channel(name) {
    if (!this.queues.has(name)) {
      this.queues.set(name, []);
    }
    return this.queues.get(name);
  }

  async enqueue(channel, task) {
    const queue = this.channel(channel);
    queue.push(task);
    await this.processQueue(channel);
  }

  async processQueue(channel) {
    const queue = this.channel(channel);
    while (queue.length > 0) {
      const task = queue[0];
      try {
        await task();
        queue.shift();
      } catch (error) {
        console.error('Queue processing error:', error);
        break;
      }
    }
  }
}

// Constants
const ConsentMode = {
  Always: 1,
  Never: 2,
  CMP: 3
};

const TrackingMode = {
  Disabled: 0,
  Partial: 1,
  Full: 2
};

// Usage Example
const analytics = new Analytics({
  companyCode: '1b22bd59',
  companyID: 2293,
  gtm: 'GTM-XXXX'
});

analytics.initializeConsent();
analytics.initializeGTM();
analytics.trackPageVisit();

// Export for use
export default Analytics;

// ... previous code ...

class Analytics {
  constructor(config = {}) {
    // ... previous constructor code ...

    // Add storage keys
    this.STORAGE_KEYS = {
      DEVICE_ID: 'ld_id',
      SESSION_ID: 'ld_session_id',
      SESSION_ORIGIN: 'ld_session_origin'
    };
  }

  // Device ID Methods
  async getDeviceId() {
    if (!this.state.userTrackingEnabled) {
      console.debug('User tracking disabled - no device ID available');
      return null;
    }
    return this.getStoredDeviceId() || (await this.generateNewDeviceId());
  }

  getStoredDeviceId() {
    if (!window.localStorage) {
      return null;
    }

    const storedId = localStorage.getItem(this.STORAGE_KEYS.DEVICE_ID);
    if (!storedId || storedId === 'undefined') {
      localStorage.removeItem(this.STORAGE_KEYS.DEVICE_ID);
      return null;
    }

    return storedId;
  }

  async generateNewDeviceId() {
    try {
      // Generate fingerprint components
      const fingerprint = await this.generateBrowserFingerprint();

      // Make request to identity API
      const response = await this.fetchNewDeviceId(fingerprint);

      if (response && response.id) {
        this.storeDeviceId(response.id);
        return response.id;
      }

      throw new Error('Failed to generate device ID');
    } catch (error) {
      console.error('Error generating device ID:', error);
      return null;
    }
  }

  async generateBrowserFingerprint() {
    const components = [
      navigator.userAgent, // Browser and OS info
      navigator.language, // User's language preference
      navigator.platform, // Operating system platform
      navigator.vendor, // Browser vendor
      screen.height, // Screen height in pixels
      screen.width, // Screen width in pixels
      screen.colorDepth, // Color depth of the screen
      new Date().getTimezoneOffset(), // User's timezone
      !!navigator.cookieEnabled, // Whether cookies are enabled
      !!window.sessionStorage, // Whether sessionStorage is available
      !!window.localStorage, // Whether localStorage is available
      !!window.indexedDB, // Whether indexedDB is available
      !!document.body.addBehavior, // IE-specific behavior
      !!window.openDatabase, // Whether WebSQL is available
      !!navigator.cpuClass, // CPU class information
      !!navigator.platformVersion, // Platform version
      typeof window.orientation !== 'undefined', // Is mobile device?
      navigator.hardwareConcurrency, // Number of CPU cores
      Array.from(navigator.plugins)
        .map(p => p.name)
        .join(',') // Installed plugins
    ];

//     Now, about the !! operator:

// The !! is a double logical NOT operator
// It's used to convert any value to its boolean representation
// It's a quick way to force a "truthy" or "falsy" value into an actual boolean (true or false)

    // Generate hash of components
    const fingerprintStr = components.join('|||');
    return await this.hashString(fingerprintStr);
  }

  async hashString(str) {
    // Use SHA-256 for hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async fetchNewDeviceId(fingerprint) {
    const url = `${this.config.identityAPIURL}/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fingerprint: fingerprint,
          existingId: this.getStoredDeviceId(),
          companyCode: this.config.companyCode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching device ID:', error);
      return null;
    }
  }

  storeDeviceId(deviceId) {
    if (window.localStorage) {
      localStorage.setItem(this.STORAGE_KEYS.DEVICE_ID, deviceId);
    }
  }

  // Session ID Methods
  getOrCreateSessionId(maxAge = 3600000) {
    // Default 1 hour
    const storage = window.localStorage;
    if (!storage) {
      return null;
    }

    const currentOrigin = this.getCurrentOrigin();
    const storedSessionData = storage.getItem(this.STORAGE_KEYS.SESSION_ID);

    if (!storedSessionData) {
      return this.createNewSession(currentOrigin);
    }

    const [sessionId, timestamp, origin] = storedSessionData.split(':');

    // Check if session is expired or origin changed
    if (Date.now() - Number(timestamp) > maxAge || origin !== currentOrigin) {
      return this.createNewSession(currentOrigin);
    }

    // Update timestamp
    storage.setItem(this.STORAGE_KEYS.SESSION_ID, `${sessionId}:${Date.now()}:${currentOrigin}`);

    return sessionId;
  }

  createNewSession(origin) {
    const sessionId = this.generateUUID();
    localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, `${sessionId}:${Date.now()}:${origin}`);
    return sessionId;
  }

  getCurrentOrigin() {
    const url = window.location.href;
    const match = url.match(/^https?:\/\/([^/]+)/i);
    return match ? match[1] : '';
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// ... rest of the code ...
