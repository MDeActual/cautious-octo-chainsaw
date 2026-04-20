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
  annualSavings?: string;
  roi?: string;
  timeToValue?: string;
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
    annualSavings: '$23,400',
    roi: '551%',
    timeToValue: '5-7 days',
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
    annualSavings: '$54,300',
    roi: '656%',
    timeToValue: '3-5 days',
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
    annualSavings: '$152,000',
    roi: '747%',
    timeToValue: '1-2 days',
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
 * TierComparison component for the Upgrade page with ROI metrics
 * Note: ROI calculations are illustrative examples based on industry averages and may vary by organization
 */
export default function TierComparison(): React.ReactElement {
  const handleContactSales = (): void => {
    window.location.href = 'mailto:sales@cloudmatrix.ca?subject=SecurePulse Elite Tier Inquiry';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`rounded-xl p-6 border ${
            tier.isRecommended
              ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500 ring-2 ring-blue-500/50 shadow-xl'
              : 'bg-gray-800 border-gray-700'
          } flex flex-col relative overflow-hidden`}
        >
          {tier.isRecommended && (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full self-start mb-4 shadow-lg">
                ⭐ BEST VALUE
              </div>
            </>
          )}

          <div className="mb-4 relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-white">{tier.price}</span>
              <span className="text-gray-400 text-sm">{tier.priceDetail}</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">{tier.description}</p>

            {/* ROI Metrics */}
            {tier.roi && (
              <div className="space-y-2 mb-4">
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Annual Savings</span>
                    <span className="text-sm font-bold text-green-400">{tier.annualSavings}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">ROI</p>
                    <p className="text-lg font-bold text-blue-400">{tier.roi}</p>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-xs font-semibold text-purple-400">{tier.timeToValue}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ul className="space-y-2.5 mb-6 flex-1 relative z-10">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 flex-shrink-0 ${
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
            onClick={tier.name === 'Elite' ? handleContactSales : undefined}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all relative z-10 ${
              tier.isRecommended
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
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

    <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
      <p className="text-xs text-gray-400 text-center">
        <strong className="text-blue-400">ROI Disclaimer:</strong> Annual savings and ROI figures are illustrative examples based on industry averages
        for breach prevention, productivity gains, and compliance cost avoidance. Actual results vary by organization size, industry,
        and current security posture. Contact sales for a customized assessment.
      </p>
    </div>
  </>
  );
}
