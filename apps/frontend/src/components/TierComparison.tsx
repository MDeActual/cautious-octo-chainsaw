import type React from 'react';

interface TierFeature {
  name: string;
  included: boolean;
}

interface Tier {
  name: string;
  price: string;
  priceDetail: string;
  description: string;
  features: TierFeature[];
  isRecommended?: boolean;
  ctaText: string;
  ctaEnabled: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    priceDetail: 'per month',
    description: 'Get started with security assessment',
    features: [
      { name: 'Secure Score dashboard', included: true },
      { name: 'Risk level assessment', included: true },
      { name: 'Security recommendations', included: true },
      { name: 'CIS Controls mapping', included: true },
      { name: 'Read-only access', included: true },
      { name: 'Automated improvements', included: false },
      { name: 'Compliance monitoring', included: false },
      { name: 'AI-powered insights', included: false },
    ],
    ctaText: 'Current Plan',
    ctaEnabled: false,
  },
  {
    name: 'Core',
    price: '$299',
    priceDetail: 'per month',
    description: 'Automated security improvements',
    isRecommended: true,
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Automated security improvements', included: true },
      { name: 'Compliance tracking', included: true },
      { name: 'Basic AI recommendations', included: true },
      { name: 'Email notifications', included: true },
      { name: 'Priority support', included: true },
      { name: '24/7 monitoring', included: false },
      { name: 'Dedicated SOC analyst', included: false },
    ],
    ctaText: 'Upgrade to Core',
    ctaEnabled: true,
  },
  {
    name: 'Pro',
    price: '$599',
    priceDetail: 'per month',
    description: 'Advanced monitoring and insights',
    features: [
      { name: 'Everything in Core', included: true },
      { name: '24/7 security monitoring', included: true },
      { name: 'Advanced AI insights', included: true },
      { name: 'Incident response playbooks', included: true },
      { name: 'Quarterly security reviews', included: true },
      { name: 'Custom compliance reports', included: true },
      { name: 'Dedicated SOC analyst', included: false },
      { name: 'Custom integrations', included: false },
    ],
    ctaText: 'Upgrade to Pro',
    ctaEnabled: true,
  },
  {
    name: 'Elite',
    price: '$1,499',
    priceDetail: 'per month',
    description: 'Full managed SOC service',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Dedicated SOC analyst', included: true },
      { name: 'Custom security policies', included: true },
      { name: 'Advanced threat hunting', included: true },
      { name: 'White-glove onboarding', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'SLA guarantees', included: true },
      { name: 'Unlimited support', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaEnabled: true,
  },
];

/**
 * TierComparison component for the Upgrade page
 */
export default function TierComparison(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`rounded-xl p-6 border ${
            tier.isRecommended
              ? 'bg-blue-900/20 border-blue-500 ring-2 ring-blue-500/50'
              : 'bg-gray-800 border-gray-700'
          } flex flex-col`}
        >
          {tier.isRecommended && (
            <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full self-start mb-4">
              RECOMMENDED
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-white">{tier.price}</span>
              <span className="text-gray-400 text-sm">{tier.priceDetail}</span>
            </div>
            <p className="text-gray-400 text-sm">{tier.description}</p>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 ${
                    feature.included ? 'text-green-400' : 'text-gray-600'
                  }`}
                >
                  {feature.included ? '✓' : '×'}
                </span>
                <span
                  className={feature.included ? 'text-gray-300' : 'text-gray-600'}
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>

          <button
            disabled={!tier.ctaEnabled}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              tier.isRecommended
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : tier.ctaEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {tier.ctaText}
          </button>
        </div>
      ))}
    </div>
  );
}
