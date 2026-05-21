import type { LegalSection } from '@/components/marketing/legal-document'
import {
  COMPANY_ADDRESS,
  DPO_EMAIL,
  PRIVACY_EMAIL,
  SERVER_REGION,
} from '@/lib/site'

export const PRIVACY_EFFECTIVE_DATE = 'May 22, 2026'

export const privacySections: LegalSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    blocks: [
      {
        type: 'p',
        text: 'Welcome to the Food Database API ("API," "we," "us," or "our"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use our API services, developer portal, and related documentation. Please read this policy carefully. If you disagree with its terms, please discontinue use of our services.',
      },
    ],
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    blocks: [
      { type: 'p', text: '2.1 Information You Provide Directly' },
      {
        type: 'p',
        text: 'When you register for an API key or create a developer account, we may collect:',
      },
      {
        type: 'ul',
        items: [
          'Full name and email address',
          'Company or organization name',
          'Billing information (processed securely through third-party payment processors)',
          'Use case description and intended application details',
          'Contact preferences and communication settings',
        ],
      },
      { type: 'p', text: '2.2 Information Collected Automatically' },
      {
        type: 'p',
        text: 'When you use the Food Database API, we automatically collect:',
      },
      {
        type: 'ul',
        items: [
          'API request logs including endpoints accessed, timestamps, and HTTP status codes',
          'IP addresses and geographic location data (country/region level)',
          'Device and browser information for developer portal access',
          'Authentication tokens and API key usage patterns',
          'Rate limit consumption and quota usage statistics',
          'Error logs and diagnostic data for service improvement',
        ],
      },
      { type: 'p', text: '2.3 Food Data Queries' },
      {
        type: 'p',
        text: 'We collect and may retain information about the food items, nutrients, and database queries you submit through the API. This data is used to improve our database accuracy, identify popular queries, and enhance service performance. Query data is anonymized where possible and not linked to individual users unless required for abuse prevention.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    blocks: [
      {
        type: 'p',
        text: 'We use the information we collect for the following purposes:',
      },
      { type: 'p', text: '3.1 Service Provision' },
      {
        type: 'ul',
        items: [
          'Authenticate API requests and validate API keys',
          'Deliver food database query results and nutritional data',
          'Process payments and manage subscriptions',
          'Provide developer support and technical assistance',
        ],
      },
      { type: 'p', text: '3.2 Service Improvement' },
      {
        type: 'ul',
        items: [
          'Analyze usage patterns to improve API performance and reliability',
          'Expand and curate our food and nutrition database',
          'Develop new features and data endpoints based on developer needs',
          'Conduct internal research and analytics',
        ],
      },
      { type: 'p', text: '3.3 Security and Compliance' },
      {
        type: 'ul',
        items: [
          'Detect and prevent unauthorized API access and abuse',
          'Monitor for rate limit violations and terms of service breaches',
          'Comply with applicable laws and regulatory requirements',
          'Respond to legal requests from competent authorities',
        ],
      },
      { type: 'p', text: '3.4 Communications' },
      {
        type: 'ul',
        items: [
          'Send transactional emails (API key confirmations, billing receipts)',
          'Notify you of material changes to this policy or our terms',
          'Share product updates, new features, and developer newsletters (with opt-out)',
        ],
      },
    ],
  },
  {
    id: 'data-sharing',
    title: '4. Data Sharing and Disclosure',
    blocks: [
      {
        type: 'p',
        text: 'We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:',
      },
      { type: 'p', text: '4.1 Service Providers' },
      {
        type: 'p',
        text: 'We engage trusted third-party service providers who assist us in operating our services, including cloud hosting providers, payment processors, analytics platforms, and customer support tools. These providers are contractually obligated to handle your data securely and only for the purposes we specify.',
      },
      { type: 'p', text: '4.2 Legal Requirements' },
      {
        type: 'p',
        text: 'We may disclose your information if required to do so by law, subpoena, court order, or other governmental or law enforcement authority, or when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, or to investigate fraud or security issues.',
      },
      { type: 'p', text: '4.3 Business Transfers' },
      {
        type: 'p',
        text: 'In the event of a merger, acquisition, sale of assets, or bankruptcy, your information may be transferred as part of the transaction. You will be notified via email and/or a prominent notice on our developer portal of any such change in ownership.',
      },
      { type: 'p', text: '4.4 Aggregated or Anonymized Data' },
      {
        type: 'p',
        text: 'We may share aggregated, anonymized, or de-identified information that cannot reasonably be used to identify you. For example, we may publish industry reports on trends in nutritional data queries.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    blocks: [
      {
        type: 'p',
        text: 'We retain your personal information for as long as your developer account is active or as needed to provide services. Specifically:',
      },
      {
        type: 'ul',
        items: [
          'API key and account data: retained for the duration of your account plus 90 days after deletion',
          'Request logs: retained for up to 12 months for security and debugging purposes',
          'Billing records: retained for 7 years as required by applicable financial regulations',
          'Support communications: retained for 3 years',
        ],
      },
      {
        type: 'p',
        text: `You may request deletion of your account and associated data at any time by contacting us at ${PRIVACY_EMAIL}. Certain data may be retained longer where required by law.`,
      },
    ],
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    blocks: [
      {
        type: 'p',
        text: 'We implement industry-standard security measures to protect your information, including:',
      },
      {
        type: 'ul',
        items: [
          'TLS 1.2 or higher encryption for all data in transit',
          'AES-256 encryption for sensitive data at rest',
          'API key hashing — we do not store raw API keys',
          'Regular security audits and penetration testing',
          'Role-based access controls within our organization',
          'Two-factor authentication for developer portal accounts',
        ],
      },
      {
        type: 'p',
        text: 'While we take reasonable precautions, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your information.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '7. Your Rights and Choices',
    blocks: [
      {
        type: 'p',
        text: 'Depending on your jurisdiction, you may have the following rights with respect to your personal data:',
      },
      {
        type: 'ul',
        items: [
          'Access: Request a copy of the personal information we hold about you',
          'Correction: Request correction of inaccurate or incomplete information',
          'Deletion: Request erasure of your personal information (subject to legal obligations)',
          'Portability: Receive your data in a structured, machine-readable format',
          'Objection: Object to certain processing activities, including marketing communications',
          'Restriction: Request that we limit the way we process your data in certain circumstances',
        ],
      },
      {
        type: 'p',
        text: `To exercise any of these rights, please contact us at ${PRIVACY_EMAIL}. We will respond to your request within 30 days.`,
      },
    ],
  },
  {
    id: 'cookies',
    title: '8. Cookies and Tracking (Developer Portal)',
    blocks: [
      {
        type: 'p',
        text: 'Our developer portal uses cookies and similar tracking technologies. Please refer to our separate Cookie Policy for detailed information on the cookies we use and how to manage your preferences.',
      },
    ],
  },
  {
    id: 'children',
    title: "9. Children's Privacy",
    blocks: [
      {
        type: 'p',
        text: `The Food Database API and developer portal are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you become aware that a child has provided us with personal information without parental consent, please contact us immediately at ${PRIVACY_EMAIL} and we will take steps to delete such information.`,
      },
    ],
  },
  {
    id: 'international',
    title: '10. International Data Transfers',
    blocks: [
      {
        type: 'p',
        text: `Our servers are located in ${SERVER_REGION}. If you access our API from outside this region, your information may be transferred to and processed in a country with different data protection laws. We implement appropriate safeguards, such as Standard Contractual Clauses, to ensure adequate protection of your data during international transfers.`,
      },
    ],
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on our developer portal and sending an email to your registered address at least 14 days before the changes take effect. Your continued use of the API after the effective date constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have questions, concerns, or requests regarding this Privacy Policy, please contact:',
      },
      {
        type: 'ul',
        items: [
          'Privacy Officer — Food Database API',
          `Email: ${PRIVACY_EMAIL}`,
          `Address: ${COMPANY_ADDRESS}`,
          `Data Protection Officer (EU/EEA inquiries): ${DPO_EMAIL}`,
        ],
      },
    ],
  },
]
