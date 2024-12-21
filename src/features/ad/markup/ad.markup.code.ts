import { AdRequest } from './ad.markup.types';

export function initializeAd(adRequest: AdRequest): void {
  const container = document.getElementById(adRequest.targetId);
  if (!container) {
    console.error('Ad container not found:', adRequest.targetId);
    return;
  }

  const adFrame = document.createElement('div');
  adFrame.style.width = '100%';
  adFrame.style.height = '250px';
  adFrame.style.border = '1px solid #ccc';

  // Add custom content based on URL
  const content = document.createElement('div');
  content.textContent = 'Ad content for: ' + adRequest.fingerprintId;
  adFrame.appendChild(content);

  container.appendChild(adFrame);
  container.onclick = () => {
    console.log('Ad clicked:', adRequest.fingerprintId);
  };
}
