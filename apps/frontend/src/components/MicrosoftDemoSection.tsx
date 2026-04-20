import type React from 'react';

/**
 * Microsoft Demo & Education Section
 * Video embeds and interactive demos showcasing Microsoft security products
 * Adapted from dutch-ai-canvas EducationSection
 */
export default function MicrosoftDemoSection(): React.ReactElement {
  const demos = [
    {
      title: 'Microsoft Defender XDR Overview',
      description: 'Extended detection and response across endpoints, email, identity, and cloud apps.',
      type: 'demo',
      duration: '20 min',
      link: 'https://cdx.transform.microsoft.com',
      badge: 'Interactive Demo'
    },
    {
      title: 'Compliance Manager Walkthrough',
      description: 'Automate compliance assessments for PIPEDA, Law 25, and SOC 2.',
      type: 'video',
      duration: '12 min',
      videoId: 'r1vs8NwSx4o',
      badge: 'Video Tutorial'
    },
    {
      title: 'Microsoft Sentinel SOC Demo',
      description: 'Cloud-native SIEM with AI-powered threat detection at scale.',
      type: 'demo',
      duration: '25 min',
      link: 'https://cdx.transform.microsoft.com',
      badge: 'Interactive Demo'
    },
  ];

  return (
    <section className="py-20 bg-gray-800/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <span className="text-2xl">📺</span>
            <span className="text-sm font-medium text-blue-400">See It In Action</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Microsoft Security Demos
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore interactive demos and video tutorials showcasing the Microsoft security
            products that power SecurePulse.
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <div
              key={demo.title}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all group"
            >
              {/* Demo Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                {demo.type === 'video' && demo.videoId ? (
                  <div className="w-full h-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${demo.videoId}`}
                      title={demo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🛡️</div>
                    <a
                      href={demo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span>Launch Demo</span>
                      <span>→</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Demo Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    {demo.badge}
                  </span>
                  <span className="text-xs text-gray-500">{demo.duration}</span>
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {demo.title}
                </h3>
                <p className="text-sm text-gray-400">{demo.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Want to see SecurePulse in action with your data?
            </h3>
            <p className="text-gray-400 mb-6">
              Schedule a personalized demo to see how SecurePulse can transform your Microsoft 365 security posture.
            </p>
            <button
              onClick={() => window.open('https://calendly.com/cloudmatrix', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg"
            >
              Schedule Your Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
