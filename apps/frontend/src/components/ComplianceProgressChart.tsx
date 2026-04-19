import type React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ComplianceProgressChartProps {
  cisControlsCount?: number;
  cisControlsTotal?: number;
}

/**
 * Compliance Progress Chart - visualizes compliance framework status
 * Shows CIS Controls coverage and regional compliance readiness
 */
export default function ComplianceProgressChart({
  cisControlsCount = 12,
  cisControlsTotal = 18,
}: ComplianceProgressChartProps): React.ReactElement {
  // Calculate compliance percentages
  const cisPercentage = Math.round((cisControlsCount / cisControlsTotal) * 100);

  // Compliance frameworks data (simulated for demo)
  const frameworks = [
    { name: 'CIS Controls v8', percentage: cisPercentage, color: '#3B82F6', priority: 'Critical' },
    { name: 'PIPEDA (Canada)', percentage: 72, color: '#10B981', priority: 'High' },
    { name: 'Quebec Law 25', percentage: 68, color: '#F59E0B', priority: 'High' },
    { name: 'Zero Trust', percentage: 55, color: '#8B5CF6', priority: 'Medium' },
  ];

  // Radial data for the main compliance chart
  const radialData = frameworks.map(framework => ({
    name: framework.name,
    value: framework.percentage,
    fill: framework.color,
  }));

  // Detailed breakdown by control category
  const categoryData = [
    { name: 'Identity & Access', value: 85, color: '#3B82F6' },
    { name: 'Data Protection', value: 62, color: '#10B981' },
    { name: 'Network Security', value: 70, color: '#F59E0B' },
    { name: 'Incident Response', value: 45, color: '#EF4444' },
    { name: 'Governance', value: 78, color: '#8B5CF6' },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any): React.ReactElement => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBg = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-900/20 border-green-700/50';
    if (percentage >= 60) return 'bg-yellow-900/20 border-yellow-700/50';
    return 'bg-red-900/20 border-red-700/50';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-medium text-gray-300 mb-4">Compliance Framework Status</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radial Chart - Framework Compliance */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3 text-center">Overall Compliance</h4>
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="10%"
              outerRadius="90%"
              barSize={18}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background={{ fill: '#1F2937' }}
                dataKey="value"
                cornerRadius={10}
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  fontSize: '12px',
                  right: -20,
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Category Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3 text-center">Control Categories</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-gray-400">{category.name}</span>
                </div>
                <span className={getStatusColor(category.value)}>{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Framework Status Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {frameworks.map((framework) => (
          <div
            key={framework.name}
            className={`rounded-lg p-3 border ${getStatusBg(framework.percentage)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{framework.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{framework.priority} Priority</p>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(framework.percentage)}`}>
                {framework.percentage}%
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${framework.percentage}%`,
                  backgroundColor: framework.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Gaps */}
      <div className="mt-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
        <h4 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
          <span>🎯</span>
          Priority Compliance Gaps
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">•</span>
            <span>
              <strong className="text-white">Incident Response:</strong> Only 45% compliant. Need documented
              playbooks and automated response workflows.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">•</span>
            <span>
              <strong className="text-white">Data Protection:</strong> 62% compliant. Missing encryption
              at rest for sensitive data and DLP policies.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">•</span>
            <span>
              <strong className="text-white">Quebec Law 25:</strong> Privacy impact assessments required
              for data processing activities.
            </span>
          </li>
        </ul>
      </div>

      {/* Upgrade CTA */}
      <div className="mt-4 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div className="flex-1">
            <p className="text-sm text-blue-300 font-medium mb-1">
              Achieve 95%+ compliance with automated controls
            </p>
            <p className="text-xs text-gray-400">
              Pro and Elite tiers include automated compliance monitoring and remediation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
