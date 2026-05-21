import type { LegalSection } from '@/components/marketing/legal-document'
import { COMPANY_ADDRESS, PRIVACY_EMAIL, SITE_URL } from '@/lib/site'

const PORTAL_HOST = SITE_URL.replace(/^https?:\/\//, '')

export const COOKIES_EFFECTIVE_DATE = 'May 22, 2026'

export const cookiesSections: LegalSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    blocks: [
      {
        type: 'p',
        text: `This Cookie Policy explains how Food Database API ("we," "us," or "our") uses cookies and similar tracking technologies on our developer portal located at ${PORTAL_HOST} (the "Portal"). This policy should be read alongside our Privacy Policy, which provides broader context on how we process personal data.`,
      },
      {
        type: 'p',
        text: 'By continuing to use our Portal, you consent to our use of cookies as described in this policy. You can withdraw or modify your consent at any time through our cookie preference center.',
      },
    ],
  },
  {
    id: 'what-are-cookies',
    title: '2. What Are Cookies?',
    blocks: [
      {
        type: 'p',
        text: 'Cookies are small text files placed on your device (computer, tablet, or smartphone) when you visit a website. They allow the website to recognize your device on subsequent visits and enable various features and functionalities.',
      },
      {
        type: 'p',
        text: 'In addition to cookies, we may use related technologies such as:',
      },
      {
        type: 'ul',
        items: [
          'Web beacons (pixel tags): Tiny transparent images embedded in pages or emails that record when content is viewed',
          'Local storage: Browser-based storage that holds data beyond the session',
          'Session storage: Temporary storage cleared when you close your browser tab',
          'Fingerprinting techniques: Device and browser characteristics used for security purposes only',
        ],
      },
    ],
  },
  {
    id: 'categories',
    title: '3. Categories of Cookies We Use',
    blocks: [
      { type: 'p', text: '3.1 Strictly Necessary Cookies' },
      {
        type: 'p',
        text: 'These cookies are essential for the operation of our developer portal and cannot be disabled. They enable core functions such as:',
      },
      {
        type: 'ul',
        items: [
          'User authentication and session management for developer accounts',
          'Security features including CSRF protection and fraud detection',
          'Storing your cookie consent preferences',
          'Load balancing to ensure stable portal performance',
        ],
      },
      {
        type: 'p',
        text: 'Legal basis: Legitimate interests (necessary to provide the service you have requested).',
      },
      {
        type: 'p',
        text: 'Cookies in this category:',
      },
      {
        type: 'ul',
        items: [
          'session_id — Maintains your login session; expires when you close your browser',
          'csrf_token — Prevents cross-site request forgery attacks; session-based',
          'cookie_consent — Stores your cookie preferences; expires after 12 months',
          'lb_route — Load balancing identifier; session-based',
        ],
      },
      { type: 'p', text: '3.2 Performance and Analytics Cookies' },
      {
        type: 'p',
        text: 'These cookies help us understand how developers use our portal so we can improve it. They collect aggregated, anonymized data and do not identify you personally.',
      },
      {
        type: 'ul',
        items: [
          'Measuring page load times and API documentation usage patterns',
          'Identifying popular endpoints and features accessed in the developer portal',
          'Detecting and diagnosing technical errors and performance issues',
          'Understanding user journeys through onboarding and setup flows',
        ],
      },
      {
        type: 'p',
        text: 'Legal basis: Consent (you may opt out at any time).',
      },
      {
        type: 'p',
        text: 'Cookies in this category:',
      },
      {
        type: 'ul',
        items: [
          '_ga, _gid (Google Analytics) — Distinguishes users and sessions; expires 2 years / 24 hours',
          '_gat — Throttles Google Analytics request rate; expires 1 minute',
          'hotjar_id (Hotjar, if applicable) — Tracks usage heatmaps; expires 1 year',
          'perf_metrics — Internal performance tracking; session-based',
        ],
      },
      { type: 'p', text: '3.3 Functional Cookies' },
      {
        type: 'p',
        text: 'These cookies enable enhanced functionality and personalization, making your experience on the developer portal more convenient:',
      },
      {
        type: 'ul',
        items: [
          'Remembering your preferred programming language for code examples (e.g., Python, JavaScript, PHP)',
          'Storing your UI preferences such as dark/light mode and sidebar state',
          'Pre-filling your developer account information in forms',
          'Maintaining your selected API version or environment (production vs. sandbox)',
        ],
      },
      {
        type: 'p',
        text: 'Legal basis: Consent (you may opt out, though some portal functionality may be affected).',
      },
      {
        type: 'p',
        text: 'Cookies in this category:',
      },
      {
        type: 'ul',
        items: [
          'lang_pref — Stores your selected code language preference; expires 6 months',
          'ui_theme — Stores your light/dark mode preference; expires 12 months',
          'api_version — Stores your selected API version; expires 3 months',
          'sidebar_state — Remembers collapsed/expanded navigation state; session-based',
        ],
      },
      { type: 'p', text: '3.4 Targeting and Marketing Cookies' },
      {
        type: 'p',
        text: 'We use these cookies on a limited basis to deliver relevant communications about our API and to measure the effectiveness of our developer outreach. These cookies may be set by our advertising partners.',
      },
      {
        type: 'ul',
        items: [
          'Measuring the effectiveness of email campaigns and developer announcements',
          'Limiting how often you see the same promotional message',
          'Identifying which marketing channels drive the most developer sign-ups',
        ],
      },
      {
        type: 'p',
        text: 'Legal basis: Consent (you may opt out at any time with no impact on portal functionality).',
      },
      {
        type: 'p',
        text: 'Cookies in this category:',
      },
      {
        type: 'ul',
        items: [
          '_fbp (Facebook Pixel, if applicable) — Measures ad effectiveness; expires 3 months',
          'li_fat_id (LinkedIn Insight, if applicable) — Tracks conversions from LinkedIn; expires 30 days',
          'campaign_attr — Internal campaign attribution tracking; expires 90 days',
        ],
      },
    ],
  },
  {
    id: 'third-party',
    title: '4. Third-Party Cookies',
    blocks: [
      {
        type: 'p',
        text: 'Some cookies on our developer portal are set by third-party services we use. We do not control these third-party cookies. Please refer to the respective privacy and cookie policies of these providers:',
      },
      {
        type: 'ul',
        items: [
          'Google Analytics — analytics.google.com — Privacy Policy: policies.google.com/privacy',
          'Stripe (payment processing) — stripe.com — Privacy Policy: stripe.com/privacy',
          'Intercom (customer support chat) — intercom.com — Privacy Policy: intercom.com/legal/privacy',
          'Cloudflare (security and CDN) — cloudflare.com — Privacy Policy: cloudflare.com/privacypolicy',
        ],
      },
    ],
  },
  {
    id: 'retention',
    title: '5. Cookie Retention Periods',
    blocks: [
      {
        type: 'p',
        text: 'Cookie lifetimes vary by type and purpose:',
      },
      {
        type: 'ul',
        items: [
          'Session cookies: Deleted automatically when you close your browser',
          'Persistent cookies: Stored for a defined period ranging from 1 minute to 2 years, as specified in Section 3',
          'Third-party cookies: Subject to the retention policies of the respective third parties',
        ],
      },
      {
        type: 'p',
        text: 'We regularly review our cookie inventory and remove cookies that are no longer necessary for their stated purpose.',
      },
    ],
  },
  {
    id: 'manage',
    title: '6. How to Manage Your Cookie Preferences',
    blocks: [
      { type: 'p', text: '6.1 Cookie Preference Center' },
      {
        type: 'p',
        text: "You can view and manage your cookie consent at any time by clicking the 'Cookie Settings' link in the footer of the developer portal. This allows you to enable or disable each category of cookies (except strictly necessary cookies).",
      },
      { type: 'p', text: '6.2 Browser Settings' },
      {
        type: 'p',
        text: 'Most browsers allow you to control cookies through their settings. You can typically:',
      },
      {
        type: 'ul',
        items: [
          'Block all cookies (note: this may prevent our portal from functioning correctly)',
          'Delete existing cookies from your device',
          'Receive notifications before cookies are set',
          'Block third-party cookies specifically',
        ],
      },
      {
        type: 'p',
        text: 'Browser-specific cookie controls can be found at:',
      },
      {
        type: 'ul',
        items: [
          'Google Chrome: chrome://settings/cookies',
          'Mozilla Firefox: Firefox Options > Privacy & Security',
          'Apple Safari: Safari > Preferences > Privacy',
          'Microsoft Edge: Edge Settings > Cookies and Site Permissions',
        ],
      },
      { type: 'p', text: '6.3 Opt-Out Tools' },
      {
        type: 'p',
        text: 'You can opt out of analytics and advertising cookies using the following tools:',
      },
      {
        type: 'ul',
        items: [
          'Google Analytics Opt-Out: tools.google.com/dlpage/gaoptout',
          'Network Advertising Initiative Opt-Out: optout.networkadvertising.org',
          'Digital Advertising Alliance Opt-Out: optout.aboutads.info',
        ],
      },
      {
        type: 'p',
        text: 'Please note that opting out of certain cookies may not prevent all tracking; it may instead result in the delivery of less relevant communications.',
      },
    ],
  },
  {
    id: 'dnt',
    title: '7. Do Not Track',
    blocks: [
      {
        type: 'p',
        text: 'Some browsers include a "Do Not Track" (DNT) feature that sends a signal to websites requesting that your browsing not be tracked. Our portal currently does not respond to DNT signals at the browser level, but you may use our Cookie Preference Center to achieve equivalent control over non-essential cookies.',
      },
    ],
  },
  {
    id: 'api-cookies',
    title: '8. Cookies in API Responses',
    blocks: [
      {
        type: 'p',
        text: 'The Food Database API itself (as distinct from the developer portal) does not set cookies in response to API calls. API authentication is handled via API keys passed in request headers, not via session cookies. Any cookies encountered during API use are attributable to your own application or browser, not our API service.',
      },
    ],
  },
  {
    id: 'updates',
    title: '9. Updates to This Cookie Policy',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Cookie Policy periodically to reflect changes in our use of cookies, changes in law, or improvements to our Portal. We will notify you of material changes by:',
      },
      {
        type: 'ul',
        items: [
          'Displaying a prominent notice on the developer portal',
          'Resetting your cookie consent so you can review and re-confirm your preferences',
          'Sending an email notification to your registered developer account address',
        ],
      },
      {
        type: 'p',
        text: "We encourage you to review this policy periodically. The 'Effective Date' at the top of this document indicates when it was last updated.",
      },
    ],
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions or concerns about our use of cookies, please contact:',
      },
      {
        type: 'ul',
        items: [
          'Privacy Team — Food Database API',
          `Email: ${PRIVACY_EMAIL}`,
          `Address: ${COMPANY_ADDRESS}`,
        ],
      },
      {
        type: 'p',
        text: 'For EU/EEA users with concerns not resolved through our channels, you have the right to lodge a complaint with your local data protection authority.',
      },
    ],
  },
]
