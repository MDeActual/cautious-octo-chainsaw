import AppShell from '../layouts/AppShell';
import TierComparison from '../components/TierComparison';

interface UpgradePageProps {
  userName?: string;
  onLogout?: () => void;
}

/**
 * Upgrade/Membership page
 * Displays tier comparison and upgrade options
 */
export default function UpgradePage({
  userName,
  onLogout,
}: UpgradePageProps): React.ReactElement {
  return (
    <AppShell userName={userName} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Security Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From free assessment to full managed SOC, we have a plan that fits your security needs
          </p>
        </div>

        <TierComparison />

        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Microsoft-Native
              </h3>
              <p className="text-gray-400 text-sm">
                Built specifically for Microsoft 365 and Azure environments
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-400 text-sm">
                Intelligent insights and recommendations powered by Azure OpenAI
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Compliance-First
              </h3>
              <p className="text-gray-400 text-sm">
                Built-in support for CIS Controls, PIPEDA, and Law 25
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-blue-400 text-2xl">💡</div>
            <div>
              <h3 className="text-white font-semibold mb-2">
                Not sure which plan is right for you?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Our team can help you choose the best plan based on your security posture,
                compliance requirements, and budget.
              </p>
              <button
                onClick={() => window.open('https://calendly.com/cloudmatrix', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Schedule a Consultation
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            All plans include a 14-day free trial. No credit card required for Free tier.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:sales@cloudmatrix.ca" className="text-blue-400 hover:text-blue-300">
              sales@cloudmatrix.ca
            </a>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
