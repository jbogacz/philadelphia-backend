import { PartnerQueryResponse } from '../partner/partner.types';
import { FingerprintComponents, Geo } from '../trace/trace.types';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';
import Mustache from 'mustache';

export async function load(
  traceId: string,
  fingerprint: { fingerprintId: string; components: FingerprintComponents },
  geo: Geo | null,
  blueprint: WidgetCodeBlueprint,
  config: WidgetCodeConfig
) {
  appendStyles(config);
  await appendWidget(blueprint, config);
  appendScript(traceId, fingerprint, geo, blueprint, config);
}

function appendStyles(config: WidgetCodeConfig) {
  let styles = config.styles;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const customColor = config.color ?? '#000000';
  const lighterColor = calculateLighterColor(customColor, 20);
  document.documentElement.style.setProperty('--partner-widget-primary-color', customColor);
  document.documentElement.style.setProperty('--partner-widget-primary-color-light', lighterColor);

  const customPosition = config.position ?? 'bottom-left';
  if (customPosition === 'bottom-right') {
    document.documentElement.style.setProperty('--partner-widget-left', 'auto');
    document.documentElement.style.setProperty('--partner-widget-right', '20px');
    document.documentElement.style.setProperty('--partner-widget-button-left', 'auto');
    document.documentElement.style.setProperty('--partner-widget-button-right', '0');
  }
}

function appendScript(
  traceId: string,
  fingerprint: { fingerprintId: string; components: FingerprintComponents },
  geo: Geo | null,
  blueprint: WidgetCodeBlueprint,
  config: WidgetCodeConfig
) {
  const template = /* javascript */ `
    function trackPartnerClick(linkData) {
      console.log('Tracking partner click {{apiUrl}}', linkData);

      // Resolve objects before stringify
      const geo = {{{geoJson}}};
      const components = {{{componentsJson}}};

      fetch('{{{apiUrl}}}' + '/public/traces/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traceId: '{{traceId}}',
          fingerprint: { fingerprintId: '{{fingerprintId}}', components: components },
          widgetKey: linkData.widgetKey,
          sourceWidgetKey: '{{{sourceWidgetKey}}}',
          geo: geo
        }),
      });
      return true;
    };

    function toggleWindow() {
      const window = document.querySelector('.partner-widget-window');
      const button = document.querySelector('.partner-widget-button');
      if (window.style.display === 'block') {
        button.style.display = 'flex';
        window.style.display = 'none';
      } else {
        button.style.display = 'none';
        window.style.display = 'block';
      }
    };

    function handleOutsideClick(event) {
      const container = document.querySelector('.partner-widget-container');
      const window = document.querySelector('.partner-widget-window');
      const button = document.querySelector('.partner-widget-button');

      // Check if the click was outside the container
      if (container && !container.contains(event.target)) {
        // Only close if the window is currently open
        if (window && window.style.display === 'block') {
          button.style.display = 'flex';
          window.style.display = 'none';
        }
      }
    }

    // Immediately set up the event listeners
    (function setupEventListeners() {
      // Add click event to close button
      const closeButton = document.querySelector('.partner-widget-close');
      if (closeButton) {
        closeButton.addEventListener('click', function() {
          toggleWindow();
        });
      }

      // Add click event listener to the document for outside clicks
      document.addEventListener('click', handleOutsideClick);
    })();
  `;

  const element = document.createElement('script');
  element.textContent = Mustache.render(template, {
    apiUrl: config.apiUrl,
    traceId: traceId,
    fingerprintId: fingerprint.fingerprintId,
    sourceWidgetKey: blueprint.widgetKey,
    componentsJson: JSON.stringify(fingerprint.components),
    geoJson: geo ? JSON.stringify(geo) : undefined,
  });
  document.head.appendChild(element);
}

async function appendWidget(blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  const template = /* html */ `
    <div class="partner-widget-container">
      <div class="partner-widget-button" onclick="toggleWindow()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        Nasi partnerzy
      </div>
      <div class="partner-widget-window">
        <div class="partner-widget-header">
          <div class="partner-widget-title">Nasi partnerzy</div>
          <div class="partner-widget-close">×</div>
        </div>
        <div class="partner-widget-content">
          <div class="partner-grid">
          {{#links}}
            <div class="partner-card">
              <div class="partner-card-content">

                <div class="partner-logo">
                  {{#hasImage}}
                    <img src="{{{imageUrl}}}" alt="{{{name}}}">
                  {{/hasImage}}
                  {{^hasImage}}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-handshake-icon lucide-handshake">
                      <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
                      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
                      <path d="m21 3 1 11h-2"/>
                      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
                      <path d="M3 4h8"/>
                    </svg>
                  {{/hasImage}}
                </div>
                <div class="partner-info">
                  <div class="partner-promo-badge">20% OFF TODAY</div>
                  <div class="partner-name">{{{name}}}</div>
                  {{#hasDescription}}
                    <div class="partner-description" title="{{{description}}}">
                      {{{description}}}
                    </div>
                  {{/hasDescription}}
                  <div class="partner-visits">
                    <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Dzisiaj: {{{todayVisits}}} odwiedzin
                  </div>
                </div>

              </div>
              {{#hasPromoMessage}}
                <div class="partner-promo-badge">{{{promoMessage}}}</div>
              {{/hasPromoMessage}}
            </div>
            {{/links}}
          </div>
        </div>
      </div>
    </div>
  `;

  const response = await fetch(`${config.apiUrl}/public/partners?widgetKey=${blueprint.widgetKey}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const partnersResponse: PartnerQueryResponse = await response.json();

  const links = partnersResponse.partners.map((link) => ({
    ...link,
    hasImage: !!link.imageUrl,
    hasDescription: !!link.description,
    hasPromoMessage: !!link.promoMessage,
    // Add the stringified version of the entire link object
    jsonString: JSON.stringify(link).replace(/"/g, '&quot;'),
  }));

  const container = document.createElement('div');
  container.innerHTML = Mustache.render(template, { links: links });
  document.body.appendChild(container);
}

function replaceCssAttribute(cssString: string, selector: string, oldProperty: string, newProperty: string, newValue: string): string {
  const selectorRegex = new RegExp(`(${selector}\\s*{[^}]*})`, 'g');
  const cssBlock = cssString.match(selectorRegex);
  if (!cssBlock) {
    console.error(`Selector "${selector}" not found in CSS`);
    return cssString;
  }
  const propertyRegex = new RegExp(`(\\s*${oldProperty}\\s*:\\s*)[^;]*(;)`, 'g');
  const propertyMatch = cssBlock[0].match(propertyRegex);
  if (!propertyMatch) {
    console.error(`Property "${oldProperty}" not found in selector "${selector}"`);
    return cssString;
  }
  const whitespaceMatch = propertyMatch[0].match(/(\s+)/);
  const whitespace = whitespaceMatch ? whitespaceMatch[0] : ' ';
  const replacement = `${whitespace}${newProperty}: ${newValue};`;
  const updatedBlock = cssBlock[0].replace(propertyRegex, replacement);
  return cssString.replace(selectorRegex, updatedBlock);
}

function calculateLighterColor(mainColor: string, lightenPercent = 20) {
  // Remove the # if it exists
  mainColor = mainColor.replace('#', '');

  // Parse the hex color into RGB components
  const r = parseInt(mainColor.substring(0, 2), 16);
  const g = parseInt(mainColor.substring(2, 4), 16);
  const b = parseInt(mainColor.substring(4, 6), 16);

  // Lighten each component by the specified percentage
  const lightenFactor = (100 + lightenPercent) / 100;

  // Cap at 255 to prevent overflow
  const lighterR = Math.min(Math.floor(r * lightenFactor), 255);
  const lighterG = Math.min(Math.floor(g * lightenFactor), 255);
  const lighterB = Math.min(Math.floor(b * lightenFactor), 255);

  // Convert back to hex and ensure 2 digits for each component
  const lighterHex = '#' +
    lighterR.toString(16).padStart(2, '0') +
    lighterG.toString(16).padStart(2, '0') +
    lighterB.toString(16).padStart(2, '0');

  return lighterHex;
}
