import { Link } from 'react-router-dom';
import type React from 'react';
import { SecurePulseLogo } from '../components/SecurePulseLogo';
import AICopilotDemo from '../components/AICopilotDemo';
import MicrosoftDemoSection from '../components/MicrosoftDemoSection';

/**
 * Public landing page for SecurePulse
 * Designed to convert visitors before authentication
 */
export default function LandingPage(): React.ReactElement {
  const handleScheduleDemo = (): void => {
    // Calendly integration - replace with actual Calendly link
    window.open('https://calendly.com/cloudmatrix', '_blank');
  };

  const handleContactSales = (): void => {
    window.location.href = 'mailto:sales@cloudmatrix.ca?subject=SecurePulse Enterprise Inquiry';
  };

  const trustBadges = [
    { name: 'MISA Partner', icon: '🛡️' },
    { name: 'PIPEDA Compliant', icon: '🇨🇦' },
    { name: 'CIS v8 Ready', icon: '✓' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <SecurePulseLogo size={32} showText={true} />
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#demos" className="text-sm text-gray-400 hover:text-white transition-colors">
              Demos
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-xl">🛡️</span>
            <span className="text-sm font-medium text-blue-400">
              AI-First, Security-First Microsoft 365 MSSP
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Microsoft 365 Security,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Simplified
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            AI-native security posture management designed specifically for Microsoft 365 and Azure environments.
            Get instant visibility, automated improvements, and compliance confidence.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Free Assessment
          </Link>
          <Link
            to="/preview"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors border border-purple-500 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Dashboard
          </Link>
          <button
            onClick={handleScheduleDemo}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors border border-gray-600"
          >
            Schedule Demo
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Free tier available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>14-day trial for paid tiers</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <span className="text-gray-500 font-medium">Trusted by:</span>
          {trustBadges.map((badge) => (
            <div key={badge.name} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-gray-300">{badge.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props Section */}
      <section id="features" className="bg-gray-800/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why SecurePulse?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-3">Microsoft-Native</h3>
              <p className="text-gray-400">
                Built specifically for Microsoft 365 and Azure. Integrates directly with Microsoft Graph,
                Entra ID, and Defender for seamless security management.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Insights</h3>
              <p className="text-gray-400">
                Leverage Azure OpenAI for intelligent recommendations, executive summaries,
                and risk prioritization that helps you focus on what matters most.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Compliance-First</h3>
              <p className="text-gray-400">
                Track compliance across CIS Controls v8, PIPEDA, Quebec Law 25, and Microsoft Zero Trust.
                Built for Canadian regulatory contexts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-8 border border-blue-700/50">
              <h3 className="text-2xl font-semibold text-white mb-4">Real-Time Security Assessment</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>Instant Microsoft Secure Score visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>Risk level classification and lead ranking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>Prioritized security recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span>CIS Controls mapping and tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-8 border border-purple-700/50">
              <h3 className="text-2xl font-semibold text-white mb-4">Automated Security Operations</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>One-click remediation for common issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>24/7 continuous monitoring and alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>Automated policy deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>Compliance tracking and reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Copilot Demo Section */}
      <AICopilotDemo />

      {/* Microsoft Demo & Education Section */}
      <section id="demos">
        <MicrosoftDemoSection />
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Security Plan
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From free assessment to full managed SOC, we have a plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Free Tier */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400 text-sm">per month</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Get started with security assessment</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Secure Score dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Risk level assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Security recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">CIS Controls mapping</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="w-full block text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Core Tier */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border-2 border-blue-500 ring-2 ring-blue-500/50 shadow-xl relative">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                ⭐ BEST VALUE
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 mt-2">Core</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$299</span>
                <span className="text-gray-400 text-sm">per month</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Automated security improvements</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Everything in Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Automated improvements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Compliance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">AI recommendations</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="w-full block text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                Start 14-Day Trial
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$599</span>
                <span className="text-gray-400 text-sm">per month</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Advanced monitoring and insights</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Everything in Core</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">24/7 monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Advanced AI insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Incident response</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="w-full block text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start 14-Day Trial
              </Link>
            </div>

            {/* Elite Tier */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$1,499</span>
                <span className="text-gray-400 text-sm">per month</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Full managed SOC service</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Dedicated SOC analyst</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Custom policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Threat hunting</span>
                </li>
              </ul>
              <button
                onClick={handleContactSales}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              All paid plans include a 14-day free trial. No credit card required for Free tier.
            </p>
            <p className="text-gray-400 text-sm">
              Questions? Contact us at{' '}
              <a href="mailto:sales@cloudmatrix.ca" className="text-blue-400 hover:text-blue-300">
                sales@cloudmatrix.ca
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-gray-800/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🇨🇦</div>
              <h3 className="text-lg font-semibold text-white mb-2">Canadian-First</h3>
              <p className="text-gray-400 text-sm">
                Designed for Canadian businesses with Quebec Law 25 and PIPEDA support
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">☁️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Azure-Native</h3>
              <p className="text-gray-400 text-sm">
                Built on Microsoft Azure with enterprise-grade security and reliability
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="text-lg font-semibold text-white mb-2">Zero Trust Security</h3>
              <p className="text-gray-400 text-sm">
                Security-first architecture with tenant isolation and encryption at rest
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to secure your Microsoft 365 environment?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start with a free security assessment. No credit card required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <button
              onClick={handleScheduleDemo}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors border border-gray-600"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex flex-col mb-4">
                <span className="text-xl font-bold text-blue-400">SecurePulse</span>
                <span className="text-xs text-gray-500">by CloudMatrix Business Solutions</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-native security for Microsoft 365
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:sales@cloudmatrix.ca" className="hover:text-white transition-colors">Contact Sales</a></li>
                <li><button onClick={handleScheduleDemo} className="hover:text-white transition-colors">Schedule Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
            SecurePulse &copy; {new Date().getFullYear()} CloudMatrix Business Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
