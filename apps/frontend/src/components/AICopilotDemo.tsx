import type React from 'react';

/**
 * AI Copilot Demo Section
 * Interactive showcase of AI-powered security insights
 * Adapted from dutch-ai-canvas Copilot page
 */
export default function AICopilotDemo(): React.ReactElement {
  const mockInsights = [
    {
      title: 'Secure Score +4.2 this week',
      detail: 'Identity recommendations auto-remediated via Entra Conditional Access baseline.',
      badge: 'Identity',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    },
    {
      title: 'Sentinel incidents down 18%',
      detail: 'Logic Apps playbook auto-closed repetitive phishing alerts after user confirmation.',
      badge: 'SOC',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
    },
    {
      title: 'Defender coverage 92%',
      detail: '3 devices missing EDR; create task for onboarding script via Intune.',
      badge: 'Endpoint',
      color: 'bg-green-500/10 border-green-500/30 text-green-400'
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-medium text-purple-400">AI-Powered Security Operations</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Security Copilot Preview
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how Azure OpenAI analyzes your security posture in real-time,
            providing actionable insights and automated remediation recommendations.
          </p>
        </div>

        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockInsights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-6 border border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:border-gray-600 transition-all group"
            >
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 border ${item.color}`}>
                {item.badge}
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Copilot Interaction Demo */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI-Native MSSP Cockpit
              </h3>
              <p className="text-gray-400 text-sm">
                Sentinel, Defender, Secure Score, and Logic Apps playbooks in one view
              </p>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2">
              <span className="text-xl">🤖</span>
              Ask Copilot
            </button>
          </div>

          {/* Mock Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Active Incidents</div>
              <div className="text-3xl font-bold text-white">12</div>
              <p className="text-xs text-gray-500 mt-1">3 high, 5 medium, 4 low</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Mean TTR (7d)</div>
              <div className="text-3xl font-bold text-white">41m</div>
              <p className="text-xs text-gray-500 mt-1">Target &lt; 45m</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Secure Score</div>
              <div className="text-3xl font-bold text-white">78</div>
              <p className="text-xs text-gray-500 mt-1">+4.2 vs last week</p>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center">
              <span className="text-blue-400 font-medium">Demo Preview:</span> This showcases AI-powered
              capabilities. Sign up for a free assessment to see your actual security data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
