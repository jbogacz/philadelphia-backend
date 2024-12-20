(async function (window) {
  // Utility to load external script
  async function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load: ${url}`));
      document.head.appendChild(script);
    });
  }

  // Utility to wait for DOM
  async function waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  try {
    // Wait for both to complete
    await Promise.all([
      loadScript('script/fingerprint-script.js'),
      waitForDOM(),
    ]);

    const fp = await FingerprintJS.load({ monitoring: false });
    const fingerprint = await fp.get({ debug: false });
    console.log('Calculated fingerprintId:', fingerprint.visitorId);

    const targetDiv = document.getElementById('ad-slot');
    targetDiv.innerHTML = '';

    const newDiv = document.createElement('div');
    newDiv.innerHTML = fingerprint.visitorId;

    targetDiv.replaceWith(newDiv);
  } catch (error) {
    console.error('Initialization failed:', error);
  }

  window.foo = function () {};
})(window);
