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
  appendWidget(blueprint, config);
  appendScript(traceId, fingerprint, geo, config);
}

function appendStyles(config: WidgetCodeConfig) {
  let styles = config.styles;

  const customColor = config.color ?? '#000000';
  if (customColor !== '#000000') {
    styles = replaceCssAttribute(styles, '.partner-widget-button', 'background-color', 'background-color', customColor);
    styles = replaceCssAttribute(styles, '.partner-widget-button:hover', 'background-color', 'background-color', customColor);
    styles = replaceCssAttribute(styles, '.partner-widget-header', 'background-color', 'background-color', customColor);
  }

  const customPosition = config.position ?? 'bottom-left';
  if (customPosition !== 'bottom-left') {
    styles = replaceCssAttribute(styles, '.partner-widget-container', 'left', 'right', '20px');
    styles = replaceCssAttribute(styles, '.partner-widget-button', 'left', 'right', '0');
  }

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

function appendScript(
  traceId: string,
  fingerprint: { fingerprintId: string; components: FingerprintComponents },
  geo: Geo | null,
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
          sourceWidgetKey: linkData.sourceWidgetKey,
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
    componentsJson: JSON.stringify(fingerprint.components),
    geoJson: geo ? JSON.stringify(geo) : undefined,
  });
  document.head.appendChild(element);
}

function appendWidget(blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  const template = /* html */ `
    <div class="partner-widget-container">
      <div class="partner-widget-button" onclick="toggleWindow()">
        <svg class="partner-widget-icon" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8
          13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      </div>
      <div class="partner-widget-window">
        <div class="partner-widget-header">
          <div class="partner-widget-title">Our Partners</div>
          <div class="partner-widget-close">&times;</div>
        </div>
        <div class="partner-widget-content">
          <ul class="partner-list">
            {{#links}}
              <li class="partner-item">
                <a href="{{url}}" class="partner-link" target="_blank"
                  onclick="trackPartnerClick({{{jsonString}}})">
                  <span class="partner-name">{{{name}}}</span>
                  <span class="partner-url">{{{url}}}</span>
                  <span class="partner-description">{{{description}}}</span>
                </a>
              </li>
            {{/links}}
          </ul>
        </div>
      </div>
    </div>
  `;

  const preparedLinks = blueprint.links.map((link) => ({
    ...link,
    // Add the stringified version of the entire link object
    jsonString: JSON.stringify(link).replace(/"/g, '&quot;'),
  }));

  const container = document.createElement('div');
  container.innerHTML = Mustache.render(template, { links: preparedLinks });
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
