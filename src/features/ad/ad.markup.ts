type AdMarkupOptions = {
  targetId?: string;
  customUrl?: string;
};

export const createAdMarkup = (options: AdMarkupOptions) => {
  const targetId = options.targetId || 'ad-container';
  const customUrl = options.customUrl || window.location.href;

  return `
    (function() {
      const container = document.getElementById('${targetId}');
      if (!container) {
        console.error('Ad container not found:', '${targetId}');
        return;
      }

      const adFrame = document.createElement('div');
      adFrame.style.width = '100%';
      adFrame.style.height = '250px';
      adFrame.style.border = '1px solid #ccc';
      adFrame.onclick = () => {
        console.log('Ad clicked:', '${customUrl}');
      };

      // Add custom content based on URL
      const content = document.createElement('div');
      content.textContent = 'Ad content for: ' + '${customUrl}';
      adFrame.appendChild(content);

      container.appendChild(adFrame);
    })();
  `;
};
