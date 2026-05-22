import type { LegalSection } from '@/components/marketing/legal-document'
import {
  absoluteUrl,
  ARBITRATION_BODY,
  ARBITRATION_LOCATION,
  COMPANY_ADDRESS,
  JURISDICTION,
  LEGAL_EMAIL,
  SUPPORT_EMAIL,
} from '@/lib/site'

const PRICING_URL = absoluteUrl('/pricing')

export const TERMS_EFFECTIVE_DATE = 'May 22, 2026'

export const termsSections: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    blocks: [
      {
        type: 'p',
        text: 'These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Developer," "User," or "you") and Food Database API ("Company," "we," "us," or "our") governing your access to and use of the Food Database API, related documentation, sample code, and any associated services (collectively, the "Services").',
      },
      {
        type: 'p',
        text: 'By registering for an API key, accessing the API, or using any part of the Services, you confirm that you have read, understood, and agree to be bound by these Terms. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind that entity.',
      },
      {
        type: 'p',
        text: 'If you do not agree to these Terms, you must not access or use the Services.',
      },
    ],
  },
  {
    id: 'api-access',
    title: '2. API Access and Registration',
    blocks: [
      { type: 'p', text: '2.1 Account Registration' },
      {
        type: 'p',
        text: 'To obtain access to the Food Database API, you must create a developer account on our portal. You agree to:',
      },
      {
        type: 'ul',
        items: [
          'Provide accurate, current, and complete registration information',
          'Maintain and promptly update your account information',
          'Keep your API keys and credentials confidential and secure',
          'Notify us immediately of any unauthorized use of your account or API keys',
          'Accept responsibility for all activities that occur under your account',
        ],
      },
      { type: 'p', text: '2.2 API Keys' },
      {
        type: 'p',
        text: 'Upon successful registration and approval, we will issue you one or more API keys. These keys are:',
      },
      {
        type: 'ul',
        items: [
          'Personal to you and non-transferable without our written consent',
          'Subject to the rate limits and quotas specified in your subscription plan',
          'Revocable by us at any time for violation of these Terms',
        ],
      },
      {
        type: 'p',
        text: 'You must not share, sell, sublicense, or publicly disclose your API keys. Each application or project requiring API access should use a distinct API key where possible.',
      },
      { type: 'p', text: '2.3 Eligibility' },
      {
        type: 'p',
        text: 'The Services are available only to individuals aged 18 or older, and entities that are validly formed and existing under applicable law. By using the Services, you represent and warrant that you meet these requirements.',
      },
    ],
  },
  {
    id: 'permitted-use',
    title: '3. Permitted Use',
    blocks: [
      { type: 'p', text: '3.1 License Grant' },
      {
        type: 'p',
        text: 'Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Food Database API solely for:',
      },
      {
        type: 'ul',
        items: [
          'Developing, testing, and operating applications that retrieve and display food and nutritional information',
          'Internal research, analytics, or business intelligence purposes',
          'Building consumer-facing products that incorporate food, recipe, or nutrition functionality (Plus or Enterprise plans only for commercial production use)',
          'Academic or non-commercial research with attribution (Free, Basic, or Core)',
        ],
      },
      { type: 'p', text: '3.2 Attribution' },
      {
        type: 'p',
        text: 'When displaying data retrieved from the Food Database API in your application, you must include a visible attribution such as "Powered by Food Database API" or as specified in your subscription agreement. Attribution must be reasonably prominent and not obscured.',
      },
    ],
  },
  {
    id: 'prohibited',
    title: '4. Prohibited Uses',
    blocks: [
      {
        type: 'p',
        text: 'You must not use the Services to:',
      },
      {
        type: 'ul',
        items: [
          'Circumvent, disable, or interfere with any security or access control features',
          'Reverse engineer, decompile, or attempt to extract the source code or underlying data of the API',
          'Scrape, mirror, or bulk-download the entire or substantial portions of the food database (including exceeding the monthly distinct-food coverage cap, currently 5% of the database per account)',
          'Resell, sublicense, or redistribute raw API data as a competing data product or standalone dataset',
          'Use the API to create or train machine learning models intended to replicate our database without explicit written authorization',
          'Transmit malicious code, viruses, or any harmful or disruptive data through the API',
          'Use the Services for any unlawful purpose or in violation of applicable laws and regulations',
          'Make false or misleading nutritional claims based on data retrieved from the API',
          'Exceed rate limits or attempt to bypass quota restrictions through technical means',
          'Share API keys with third parties without our express written permission',
        ],
      },
    ],
  },
  {
    id: 'rate-limits',
    title: '5. Rate Limits and Quotas',
    blocks: [
      { type: 'p', text: '5.1 Plan-Based Limits' },
      {
        type: 'p',
        text: `API usage is subject to rate limits and monthly quotas as defined in your selected subscription plan. Current plan details are available on our pricing page at ${PRICING_URL}. We reserve the right to modify plan limits with 30 days' notice.`,
      },
      { type: 'p', text: '5.2 Exceeding Limits' },
      {
        type: 'p',
        text: 'If your application exceeds the rate limits defined in your plan, the API will return HTTP 429 (Too Many Requests) responses. Persistent or intentional circumvention of rate limits is a material breach of these Terms and may result in immediate suspension of your API access.',
      },
      { type: 'p', text: '5.3 Fair Use' },
      {
        type: 'p',
        text: 'Even within plan limits, we reserve the right to throttle or suspend API access if your usage patterns indicate abuse, excessive load, or use inconsistent with the intended purpose of the Services.',
      },
    ],
  },
  {
    id: 'ip',
    title: '6. Intellectual Property',
    blocks: [
      { type: 'p', text: '6.1 Our IP' },
      {
        type: 'p',
        text: 'The Food Database API, including its underlying database, algorithms, software, trademarks, logos, and all associated intellectual property, are owned by or licensed to us and are protected by applicable intellectual property laws. These Terms do not grant you any ownership rights in our IP.',
      },
      { type: 'p', text: '6.2 Your IP' },
      {
        type: 'p',
        text: 'You retain ownership of any applications, code, or products you develop using the API. However, by using the Services, you grant us a non-exclusive, royalty-free license to use anonymized data about your API usage patterns for the purpose of improving our services.',
      },
      { type: 'p', text: '6.3 Feedback' },
      {
        type: 'p',
        text: 'If you submit ideas, suggestions, or feedback about the Services ("Feedback"), you grant us an irrevocable, perpetual, worldwide, royalty-free license to use, reproduce, and incorporate such Feedback without any obligation to you.',
      },
    ],
  },
  {
    id: 'disclaimer',
    title: '7. Data Accuracy and Disclaimer',
    blocks: [
      {
        type: 'p',
        text: 'The Food Database API provides nutritional information compiled from a variety of sources. While we strive for accuracy, we make no warranty that the food data, nutritional values, allergen information, or other content provided through the API is:',
      },
      {
        type: 'ul',
        items: [
          'Complete, accurate, or up to date at all times',
          'Suitable for medical, clinical, or dietary advice purposes',
          'Free from errors introduced by source data providers',
        ],
      },
      {
        type: 'p',
        text: 'The data provided should not be used as the sole basis for medical or dietary decisions. Users of your application should be directed to consult qualified healthcare or nutrition professionals for personalized advice.',
      },
    ],
  },
  {
    id: 'sla',
    title: '8. Service Availability and SLA',
    blocks: [
      { type: 'p', text: '8.1 Uptime Target' },
      {
        type: 'p',
        text: 'We target 99.5% API uptime per calendar month, excluding scheduled maintenance and circumstances beyond our control. Actual SLA commitments depend on your subscription plan and are detailed in your plan agreement.',
      },
      { type: 'p', text: '8.2 Maintenance' },
      {
        type: 'p',
        text: 'We may perform scheduled maintenance during off-peak hours. Where possible, we will provide at least 24 hours\' advance notice via our status page and email notification.',
      },
      { type: 'p', text: '8.3 No Guarantee' },
      {
        type: 'p',
        text: 'We do not warrant that the Services will be uninterrupted, error-free, or free of harmful components. Access to the Services is provided on an "as is" and "as available" basis.',
      },
    ],
  },
  {
    id: 'payment',
    title: '9. Payment and Billing',
    blocks: [
      { type: 'p', text: '9.1 Subscription Fees' },
      {
        type: 'p',
        text: 'Paid plans are billed monthly or annually in advance, as selected at sign-up. All fees are non-refundable except as required by applicable law or as expressly stated in your plan agreement.',
      },
      { type: 'p', text: '9.2 Price Changes' },
      {
        type: 'p',
        text: 'We reserve the right to change our pricing at any time. For existing subscribers, price changes will take effect at the start of the next billing cycle following 30 days\' notice.',
      },
      { type: 'p', text: '9.3 Taxes' },
      {
        type: 'p',
        text: 'Prices listed exclude any applicable taxes (VAT, GST, sales tax, etc.). You are responsible for paying any taxes applicable to your use of the Services in your jurisdiction.',
      },
      { type: 'p', text: '9.4 Free Tier' },
      {
        type: 'p',
        text: 'We offer a free tier subject to specified limits. We reserve the right to modify, restrict, or discontinue the free tier at any time with 30 days\' notice. Free tier usage is subject to these Terms in the same manner as paid plans.',
      },
    ],
  },
  {
    id: 'termination',
    title: '10. Termination',
    blocks: [
      { type: 'p', text: '10.1 Termination by You' },
      {
        type: 'p',
        text: `You may terminate your account at any time by following the account deletion process on the developer portal or by contacting ${SUPPORT_EMAIL}. Termination does not entitle you to a refund of any prepaid fees.`,
      },
      { type: 'p', text: '10.2 Termination by Us' },
      {
        type: 'p',
        text: 'We may suspend or terminate your access to the Services immediately and without prior notice if:',
      },
      {
        type: 'ul',
        items: [
          'You breach any provision of these Terms',
          'We are required to do so by law or regulatory authority',
          'Your use of the API poses a security risk or harm to third parties',
          'We discontinue the Services (with reasonable notice where practicable)',
        ],
      },
      { type: 'p', text: '10.3 Effect of Termination' },
      {
        type: 'p',
        text: 'Upon termination, your right to access and use the Services immediately ceases. You must delete all local copies of API data obtained during your use of the Services, except as required by law. Sections 6, 7, 11, 12, and 13 survive termination.',
      },
    ],
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    blocks: [
      {
        type: 'p',
        text: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FOOD DATABASE API, ITS OFFICERS, DIRECTORS, EMPLOYEES, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
      },
      {
        type: 'p',
        text: 'OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNTS YOU PAID TO US IN THE THREE MONTHS PRECEDING THE CLAIM; OR (B) ONE HUNDRED US DOLLARS (USD 100).',
      },
    ],
  },
  {
    id: 'indemnification',
    title: '12. Indemnification',
    blocks: [
      {
        type: 'p',
        text: 'You agree to indemnify, defend, and hold harmless Food Database API and its officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or in connection with:',
      },
      {
        type: 'ul',
        items: [
          'Your use or misuse of the Services',
          'Your violation of these Terms or any applicable law',
          'Your application\'s impact on end users, including any misrepresentation of nutritional data',
          'Any infringement of third-party rights by you or your application',
        ],
      },
    ],
  },
  {
    id: 'governing-law',
    title: '13. Governing Law and Dispute Resolution',
    blocks: [
      { type: 'p', text: '13.1 Governing Law' },
      {
        type: 'p',
        text: `These Terms shall be governed by and construed in accordance with the laws of ${JURISDICTION}, without regard to its conflict of law provisions.`,
      },
      { type: 'p', text: '13.2 Dispute Resolution' },
      {
        type: 'p',
        text: `Any dispute arising from or relating to these Terms or the Services shall first be subject to good-faith negotiation between the parties. If not resolved within 30 days, disputes shall be submitted to binding arbitration under the rules of ${ARBITRATION_BODY} in ${ARBITRATION_LOCATION}. Class action proceedings are waived.`,
      },
      { type: 'p', text: '13.3 Injunctive Relief' },
      {
        type: 'p',
        text: 'Notwithstanding the above, either party may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent infringement of intellectual property rights or breach of confidentiality obligations.',
      },
    ],
  },
  {
    id: 'general',
    title: '14. General Provisions',
    blocks: [
      { type: 'p', text: '14.1 Entire Agreement' },
      {
        type: 'p',
        text: 'These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and us regarding the Services and supersede all prior or contemporaneous agreements.',
      },
      { type: 'p', text: '14.2 Modifications' },
      {
        type: 'p',
        text: 'We reserve the right to modify these Terms at any time. We will provide at least 14 days\' notice before material changes take effect. Continued use of the Services after the effective date constitutes acceptance.',
      },
      { type: 'p', text: '14.3 Severability' },
      {
        type: 'p',
        text: 'If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.',
      },
      { type: 'p', text: '14.4 Waiver' },
      {
        type: 'p',
        text: 'Failure by either party to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.',
      },
      { type: 'p', text: '14.5 Contact' },
      {
        type: 'p',
        text: 'For questions about these Terms, please contact:',
      },
      {
        type: 'ul',
        items: [
          'Legal Team — Food Database API',
          `Email: ${LEGAL_EMAIL}`,
          `Address: ${COMPANY_ADDRESS}`,
        ],
      },
    ],
  },
]
