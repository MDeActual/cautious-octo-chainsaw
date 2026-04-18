import type React from 'react';
import { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ScoreTrendChartProps {
  currentScore: number;
  maxScore: number;
}

/**
 * Score Trend Chart - visualizes security score progression over time
 * Includes historical data simulation and projection
 */
export default function ScoreTrendChart({
  currentScore,
  maxScore,
}: ScoreTrendChartProps): React.ReactElement {
  // Generate historical trend data (simulated for demo - would come from backend in production)
  // Using useMemo to ensure deterministic data generation without Math.random()
  const trendData = useMemo(() => {
    const today = new Date();
    const data = [];

    // Generate 30 days of historical data with realistic variation
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // For the most recent datapoint (i=0), use the exact currentScore
      let score: number;
      if (i === 0) {
        score = currentScore;
      } else {
        // Simulate gradual improvement leading to current score with deterministic variation
        const baseScore = currentScore - (i) * 2;
        const variation = Math.sin(i * 0.5) * 5;
        score = Math.max(0, Math.min(maxScore, baseScore + variation));
      }

      // Calculate percentage
      const percentage = (score / maxScore) * 100;

      // Industry average (deterministic - based on percentage with consistent offset)
      const industryAvg = percentage + 8 + (Math.sin(i * 0.3) * 2 + 2);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(score),
        percentage: Math.round(percentage * 10) / 10,
        industryAvg: Math.round(industryAvg * 10) / 10,
        target: 85, // Target security posture
      });
    }

    return data;
  }, [currentScore, maxScore]);
  const latestData = trendData[trendData.length - 1];
  const oldestData = trendData[0];
  const scoreChange = latestData.score - oldestData.score;
  const percentageChange = ((scoreChange / oldestData.score) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: any): React.ReactElement | null => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {(entry.name !== 'Score' && entry.name !== 'Your Score') && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-300">Security Score Trend</h3>
          <p className="text-sm text-gray-400 mt-1">Last 30 days</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {scoreChange >= 0 ? '↑' : '↓'} {Math.abs(scoreChange)}
          </div>
          <p className="text-xs text-gray-400">
            {percentageChange}% change
          </p>
        </div>
      </div>

      {/* Line Chart for Score Over Time */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            domain={[0, maxScore]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            name="Your Score"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Percentage Comparison Area Chart */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Security Posture Comparison</h4>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIndustry" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '11px' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '11px' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="percentage"
              name="Your Score"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorYou)"
            />
            <Area
              type="monotone"
              dataKey="industryAvg"
              name="Industry Average"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIndustry)"
            />
            <Area
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorTarget)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Current</p>
          <p className="text-lg font-bold text-blue-400">{latestData.percentage}%</p>
        </div>
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Industry Avg</p>
          <p className="text-lg font-bold text-green-400">{latestData.industryAvg}%</p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Target</p>
          <p className="text-lg font-bold text-yellow-400">{latestData.target}%</p>
        </div>
      </div>

      {latestData.percentage < latestData.industryAvg && (
        <div className="mt-4 bg-red-900/20 border border-red-700/50 rounded-lg p-3 flex items-start gap-2">
          <span className="text-red-400 text-lg">⚠️</span>
          <p className="text-sm text-red-300">
            Your security score is below industry average. Upgrading to a managed tier can help close this gap.
          </p>
        </div>
      )}

      {scoreChange > 0 && (
        <div className="mt-4 bg-green-900/20 border border-green-700/50 rounded-lg p-3 flex items-start gap-2">
          <span className="text-green-400 text-lg">✓</span>
          <p className="text-sm text-green-300">
            Great progress! Your score has improved by {scoreChange} points over the last 30 days.
          </p>
        </div>
      )}
    </div>
  );
}
