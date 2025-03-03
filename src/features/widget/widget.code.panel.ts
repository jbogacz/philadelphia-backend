import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export async function loadPanel(traceId: string, blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  /**
   * Standalone Partner Links Widget - TypeScript Version
   *
   * This script creates a widget in the bottom left corner that displays
   * a list of partner site links with descriptions when clicked.
   */

  interface Partner {
    name: string;
    url: string;
    description: string;
  }

  class WidgetPanel {
    private container: HTMLElement | null = null;
    private button: HTMLElement | null = null;
    private window: HTMLElement | null = null;
    private closeBtn: HTMLElement | null = null;
    private partners: Partner[];

    constructor(partners: Partner[]) {
      this.partners = partners;
      this.init();
    }

    private init(): void {
      this.injectStyles();
      this.createWidgetHTML();
      this.cacheElements();
      this.bindEvents();
    }

    private injectStyles(): void {
      const styles = `
        .partner-widget-container {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 320px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .partner-widget-button {
            background-color: #000000;
            color: white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            position: absolute;
            bottom: 0;
            left: 0;
            transition: all 0.2s ease;
            z-index: 2;
        }

        .partner-widget-button:hover {
            transform: scale(1.05);
            background-color: #171717;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }

        .partner-widget-icon {
            width: 24px;
            height: 24px;
            fill: white;
        }

        .partner-widget-window {
            display: none;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            border: 1px solid #e5e7eb;
        }

        .partner-widget-header {
            background-color: #000000;
            color: white;
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
        }

        .partner-widget-title {
            font-size: 14px;
        }

        .partner-widget-close {
            cursor: pointer;
            font-size: 18px;
            transition: all 0.1s ease;
        }

        .partner-widget-close:hover {
            opacity: 0.8;
        }

        .partner-widget-content {
            padding: 0;
            max-height: 400px;
            overflow-y: auto;
        }

        .partner-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .partner-item {
            border-bottom: 1px solid #f1f1f1;
            transition: background-color 0.1s ease;
        }

        .partner-item:last-child {
            border-bottom: none;
        }

        .partner-item:hover {
            background-color: #f9f9f9;
        }

        .partner-link {
            display: block;
            padding: 14px 16px;
            text-decoration: none;
            color: #111;
        }

        .partner-name {
            font-weight: 500;
            font-size: 14px;
            color: #000000;
            margin-bottom: 4px;
            display: block;
        }

        .partner-url {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            display: block;
            font-family: monospace;
        }

        .partner-description {
            font-size: 13px;
            color: #555555;
            line-height: 1.4;
        }
    `;

      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }

    private createWidgetHTML(): void {
      const widgetHTML = `
        <div class="partner-widget-container">
            <div class="partner-widget-button">
                <svg class="partner-widget-icon" viewBox="0 0 24 24">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                </svg>
            </div>
            <div class="partner-widget-window">
                <div class="partner-widget-header">
                    <div class="partner-widget-title">Our Partners</div>
                    <div class="partner-widget-close">&times;</div>
                </div>
                <div class="partner-widget-content">
                    <ul class="partner-list">
                        ${this.partners
                          .map(
                            (partner) => `
                            <li class="partner-item">
                                <a href="${partner.url}" class="partner-link" target="_blank">
                                    <span class="partner-name">${partner.name}</span>
                                    <span class="partner-url">${partner.url}</span>
                                    <span class="partner-description">${partner.description}</span>
                                    <span class="partner-url">${traceId}</span>
                                </a>
                            </li>
                        `
                          )
                          .join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

      // Create a container element and set its innerHTML
      const container = document.createElement('div');
      container.innerHTML = widgetHTML;

      // Append the widget to the body
      document.body.appendChild(container.firstElementChild as HTMLElement);
    }

    private cacheElements(): void {
      this.container = document.querySelector('.partner-widget-container');
      this.button = document.querySelector('.partner-widget-button');
      this.window = document.querySelector('.partner-widget-window');
      this.closeBtn = document.querySelector('.partner-widget-close');
    }

    private bindEvents(): void {
      if (!this.button || !this.window || !this.closeBtn || !this.container) {
        console.error('Partner widget elements not found');
        return;
      }

      // Toggle widget window when button is clicked
      this.button.addEventListener('click', this.toggleWindow.bind(this));

      // Close widget window when close button is clicked
      this.closeBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.closeWindow();
      });

      // Close widget when clicking outside
      document.addEventListener('click', (e: MouseEvent) => {
        if (
          this.container &&
          this.window &&
          this.button &&
          !this.container.contains(e.target as Node) &&
          this.window.style.display === 'block'
        ) {
          this.closeWindow();
        }
      });
    }

    private toggleWindow(): void {
      if (!this.window || !this.button) return;

      if (this.window.style.display === 'block') {
        this.closeWindow();
      } else {
        this.openWindow();
      }
    }

    private openWindow(): void {
      if (!this.window || !this.button) return;

      this.window.style.display = 'block';
      this.button.style.display = 'none';
    }

    private closeWindow(): void {
      if (!this.window || !this.button) return;

      this.window.style.display = 'none';
      this.button.style.display = 'flex';
    }
  }

  // Define partner data - replace with your actual partner information
  const partners: Partner[] = [
    {
      name: 'TechPartner Solutions',
      url: 'https://techpartner.example.com',
      description: 'Leading provider of cloud solutions and digital transformation services.',
    },
    {
      name: 'Creative Design Studio',
      url: 'https://creativedesign.example.com',
      description: 'Award-winning design agency specializing in branding and UI/UX design.',
    },
    {
      name: 'Marketing Gurus',
      url: 'https://marketinggurus.example.com',
      description: 'Digital marketing experts helping businesses grow online presence.',
    },
    {
      name: 'Data Analytics Pro',
      url: 'https://dataanalytics.example.com',
      description: 'Advanced data analytics and business intelligence solutions.',
    },
    {
      name: 'Security Shield',
      url: 'https://securityshield.example.com',
      description: 'Cybersecurity services and solutions for businesses of all sizes.',
    },
  ];

  new WidgetPanel(partners);
}
