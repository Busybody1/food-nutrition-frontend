import type { LegalSection } from '@/components/marketing/legal-document'
import { absoluteUrl, LEGAL_EMAIL, LEGAL_NAME } from '@/lib/site'

const PRICING_URL = absoluteUrl('/pricing')

/** Event-based effective date — rendered after "Effective" in the hero badge. */
export const COMMERCIAL_LICENSE_EFFECTIVE_DATE = 'upon Plus Plan subscription'

export const commercialLicenseSections: LegalSection[] = [
  {
    id: 'overview',
    title: 'Agreement',
    blocks: [
      {
        type: 'p',
        text: `This Commercial API License Agreement ("Agreement") is entered into by and between ${LEGAL_NAME} ("Company," "we," "us") and the entity or individual accessing the application programming interface for Commercial Use ("Client," "you"). This Agreement takes effect automatically, without requiring a countersigned copy, upon the earliest of: (a) Client's subscription to a Plus Plan; (b) Client's use of the API for Commercial Use; or (c) Client's payment of any fee associated with a Plus Plan (the "Effective Date").`,
      },
    ],
  },
  {
    id: 'definitions',
    title: '1. Definitions',
    blocks: [
      {
        type: 'ul',
        items: [
          `"API" means the application programming interface, including its endpoints, documentation, and associated Data.`,
          `"Commercial Use" means any use of the API in connection with a product, service, or activity that generates, or is intended to generate, revenue for Client or a third party, whether directly (e.g., subscription or transaction fees) or indirectly (e.g., advertising, lead generation, or internal use by a for-profit entity).`,
          `"Commercial Plan" means any paid subscription tier designated by Company as authorizing Commercial Use, as described at ${PRICING_URL} or communicated to Client in writing.`,
          `"Data" means the food, nutrition, and related content returned by the API.`,
          `"Documentation" means Company's published API reference, usage guides, and policies.`,
        ],
      },
    ],
  },
  {
    id: 'license-grant',
    title: '2. License Grant',
    blocks: [
      { type: 'p', text: '2.1 Grant of License' },
      {
        type: 'p',
        text: `Subject to Client's compliance with this Agreement and continued payment of applicable fees, Company grants Client a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the API and Data for Commercial Use, solely to the extent permitted under Client's active Plus Plan.`,
      },
      { type: 'p', text: '2.2 Scope of License' },
      {
        type: 'p',
        text: `This license is limited to the request quota, rate limits, and features associated with Client's Plus Plan, as published at ${PRICING_URL} or otherwise agreed in writing.`,
      },
    ],
  },
  {
    id: 'permitted-use',
    title: '3. Permitted Use',
    blocks: [
      { type: 'p', text: 'Subject to this Agreement, Client may:' },
      {
        type: 'ul',
        items: [
          `Integrate the API into Client's products or services, including revenue-generating ones;`,
          `Display, transmit, or otherwise use Data returned by the API within Client's product interfaces;`,
          `Cache API responses for up to 30 days to improve application performance, subject to Section 4;`,
          `Use the API in production environments consistent with the quota and rate limits of Client's Plus Plan.`,
        ],
      },
    ],
  },
  {
    id: 'restrictions',
    title: '4. Restrictions',
    blocks: [
      { type: 'p', text: 'Client shall not, and shall not permit any third party to:' },
      {
        type: 'ul',
        items: [
          `Resell, sublicense, rent, or redistribute the API or Data as a standalone product or dataset;`,
          `Systematically extract, scrape, or reconstruct a substantial portion of the underlying database (for example, through exhaustive or enumerative querying) in order to build a competing or substitute dataset;`,
          `Cache or store Data beyond the period permitted under Client's Plus Plan, or beyond 30 days, whichever is shorter, unless Client's plan expressly permits extended or unrestricted caching;`,
          `Remove, obscure, or alter proprietary notices contained in the Data, except where Client's Plus Plan expressly waives attribution;`,
          `Use the API in a manner that violates applicable law, infringes third-party rights, or exceeds the quota and rate limits of Client's Plus Plan;`,
          `Present the Data as independently verified for medical, allergen-safety, or other life-critical decisions without Client's own independent confirmation (see Section 6).`,
        ],
      },
    ],
  },
  {
    id: 'fees',
    title: '5. Fees and Payment',
    blocks: [
      { type: 'p', text: '5.1 Fees' },
      {
        type: 'p',
        text: `Client shall pay the fees associated with its selected Plus Plan, as published at ${PRICING_URL}, through Stripe.`,
      },
      { type: 'p', text: '5.2 Billing and Refunds' },
      {
        type: 'p',
        text: `Fees are billed monthly in advance and are non-refundable except as required by law or as expressly stated otherwise, including under Section 8.4.`,
      },
      { type: 'p', text: '5.3 Price Changes' },
      {
        type: 'p',
        text: `Company may change Plus Plan pricing prospectively upon at least 30 days' notice; continued use of the API after the effective date of a price change constitutes acceptance of the new pricing.`,
      },
      { type: 'p', text: '5.4 Non-Payment' },
      {
        type: 'p',
        text: `Failure to pay applicable fees may result in suspension of Client's access or reversion to Free-tier limits until payment is resolved.`,
      },
    ],
  },
  {
    id: 'disclaimer',
    title: '6. Data Accuracy; Disclaimer of Warranties',
    blocks: [
      { type: 'p', text: '6.1 As-Is Basis' },
      {
        type: 'p',
        text: `THE API AND DATA ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT.`,
      },
      { type: 'p', text: '6.2 No Accuracy Guarantee' },
      {
        type: 'p',
        text: `Company does not guarantee the completeness, accuracy, or currency of any Data, including nutritional, allergen, or ingredient information. Client is solely responsible for independently verifying Data before relying on it for any purpose where inaccuracy could result in harm, including health or safety decisions.`,
      },
      { type: 'p', text: '6.3 End-User Disclaimers' },
      {
        type: 'p',
        text: `Client shall provide its own end users with appropriate disclaimers regarding the source and limitations of Data obtained through the API.`,
      },
    ],
  },
  {
    id: 'service-level',
    title: '7. Service Level',
    blocks: [
      {
        type: 'p',
        text: `Where Client's Plus Plan includes a Service Level Agreement ("SLA"), the applicable uptime commitments, support response times, and remedies are as set out in the separate SLA document provided for that plan. In the absence of a plan-specific SLA, the API is provided without any uptime commitment.`,
      },
    ],
  },
  {
    id: 'term-termination',
    title: '8. Term and Termination',
    blocks: [
      { type: 'p', text: '8.1 Term' },
      {
        type: 'p',
        text: `This Agreement remains in effect for as long as Client maintains an active Plus Plan.`,
      },
      { type: 'p', text: '8.2 Termination' },
      {
        type: 'p',
        text: `Either party may terminate this Agreement (a) for convenience, by canceling the Plus Plan, or (b) for cause, if the other party materially breaches this Agreement and fails to cure within 15 days of written notice.`,
      },
      { type: 'p', text: '8.3 Effect of Termination' },
      {
        type: 'p',
        text: `Upon termination, Client's license to access and use the API and Data ends immediately, and Client shall, within 30 days, cease use of and delete or destroy any cached or stored Data, except as reasonably required for backup or archival purposes consistent with Section 4.`,
      },
      { type: 'p', text: '8.4 Immediate Termination for Prohibited Extraction' },
      {
        type: 'p',
        text: `Notwithstanding Section 8.2(b), if Company reasonably determines that Client has engaged in systematic scraping, enumeration, or reconstruction of the API or underlying database in violation of Section 4, Company may suspend or terminate Client's license immediately, without prior notice or opportunity to cure. Any fees already paid by Client are non-refundable, and Company may retain any prepaid but unused fees in connection with such termination.`,
      },
      { type: 'p', text: '8.5 Survival' },
      {
        type: 'p',
        text: `Sections 4, 6, 8.4, 9, 10, and 13 survive termination.`,
      },
    ],
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    blocks: [
      { type: 'p', text: '9.1 Exclusion of Indirect Damages' },
      {
        type: 'p',
        text: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO THIS AGREEMENT.`,
      },
      { type: 'p', text: '9.2 Liability Cap' },
      {
        type: 'p',
        text: `COMPANY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE FEES PAID BY CLIENT TO COMPANY IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.`,
      },
    ],
  },
  {
    id: 'indemnification',
    title: '10. Indemnification',
    blocks: [
      {
        type: 'p',
        text: `Client shall indemnify, defend, and hold harmless Company from and against any third-party claims, damages, liabilities, and expenses (including reasonable attorneys' fees) arising out of (a) Client's use of the API or Data in violation of this Agreement, or (b) Client's own products or services, except to the extent arising from Company's breach of this Agreement.`,
      },
    ],
  },
  {
    id: 'changes',
    title: '11. Changes to the API and This Agreement',
    blocks: [
      { type: 'p', text: '11.1 Changes to the API' },
      {
        type: 'p',
        text: `Company will provide at least 30 days' advance notice of any breaking API change reasonably likely to require Client to modify its integration.`,
      },
      { type: 'p', text: '11.2 Changes to This Agreement' },
      {
        type: 'p',
        text: `Company may update this Agreement from time to time. Material changes will be notified to Client by email or dashboard notice at least 30 days before taking effect. Continued Commercial Use of the API after the effective date constitutes acceptance of the updated Agreement.`,
      },
    ],
  },
  {
    id: 'confidentiality',
    title: '12. Confidentiality',
    blocks: [
      {
        type: 'p',
        text: `Each party agrees to protect any non-public information disclosed by the other party in connection with this Agreement using the same degree of care it uses for its own confidential information of a similar nature, and in no event less than reasonable care.`,
      },
    ],
  },
  {
    id: 'governing-law',
    title: '13. Governing Law',
    blocks: [
      {
        type: 'p',
        text: `This Agreement is governed by the laws of England and Wales, without regard to conflict-of-laws principles. The courts of England and Wales shall have exclusive jurisdiction to settle any dispute arising out of or in connection with this Agreement.`,
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
        text: `This Agreement, together with the Documentation and any applicable SLA, constitutes the entire agreement between the parties regarding Commercial Use of the API.`,
      },
      { type: 'p', text: '14.2 Assignment' },
      {
        type: 'p',
        text: `Client may not assign this Agreement without Company's prior written consent, except in connection with a merger, acquisition, or sale of substantially all assets.`,
      },
      { type: 'p', text: '14.3 Severability' },
      {
        type: 'p',
        text: `If any provision of this Agreement is held unenforceable, the remaining provisions remain in full force and effect.`,
      },
      { type: 'p', text: '14.4 No Waiver' },
      {
        type: 'p',
        text: `Failure to enforce any provision of this Agreement is not a waiver of the right to enforce it later.`,
      },
      { type: 'p', text: '14.5 Notices' },
      {
        type: 'p',
        text: `Notices under this Agreement shall be sent to ${LEGAL_EMAIL} and the email address on file for Client's account.`,
      },
    ],
  },
  {
    id: 'contact',
    title: '15. Contact',
    blocks: [
      {
        type: 'p',
        text: `Questions about this Agreement may be directed to ${LEGAL_EMAIL}.`,
      },
    ],
  },
]
