import type React from 'react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ROICalculatorProps {
  currentScore?: number;
  maxScore?: number;
  opportunityScore?: number;
}

/**
 * ROI Calculator - shows potential cost savings and value proposition
 * Investor-grade visualization of security improvement ROI
 */
export default function ROICalculator({
  currentScore = 150,
  maxScore = 300,
}: ROICalculatorProps): React.ReactElement {
  const [employeeCount, setEmployeeCount] = useState<number>(25);

  // Calculate potential costs based on security gaps
  const scorePercentage = (currentScore / maxScore) * 100;
  const securityGap = 100 - scorePercentage;

  // Industry average costs for security incidents (per year)
  const avgBreachCost = 150000; // Average SMB breach cost
  const avgDowntimeHours = 24;
  const avgHourlyRevenue = 500;
  const complianceFineRisk = 50000;

  // Calculate risk-adjusted costs based on security gap
  const riskMultiplier = securityGap / 100;
  const annualBreachRisk = avgBreachCost * riskMultiplier * 0.3; // 30% chance factor
  const downtimeRisk = avgDowntimeHours * avgHourlyRevenue * riskMultiplier * 0.2;
  const complianceRisk = complianceFineRisk * riskMultiplier * 0.15;
  const productivityLoss = employeeCount * 2000 * riskMultiplier; // $2k/year per employee in lost productivity

  const totalAnnualRisk = annualBreachRisk + downtimeRisk + complianceRisk + productivityLoss;

  // Savings with CloudMatrix tiers
  const coreTierSavings = totalAnnualRisk * 0.65; // 65% risk reduction
  const proTierSavings = totalAnnualRisk * 0.85; // 85% risk reduction
  const eliteTierSavings = totalAnnualRisk * 0.95; // 95% risk reduction

  // Calculate ROI
  const coreTierCost = 299 * 12; // $299/month
  const proTierCost = 599 * 12; // $599/month
  const eliteTierCost = 1499 * 12; // $1,499/month

  const coreROI = ((coreTierSavings - coreTierCost) / coreTierCost) * 100;
  const proROI = ((proTierSavings - proTierCost) / proTierCost) * 100;
  const eliteROI = ((eliteTierSavings - eliteTierCost) / eliteTierCost) * 100;

  const roiData = [
    {
      name: 'Core',
      savings: Math.round(coreTierSavings),
      cost: coreTierCost,
      net: Math.round(coreTierSavings - coreTierCost),
      roi: Math.round(coreROI),
    },
    {
      name: 'Pro',
      savings: Math.round(proTierSavings),
      cost: proTierCost,
      net: Math.round(proTierSavings - proTierCost),
      roi: Math.round(proROI),
    },
    {
      name: 'Elite',
      savings: Math.round(eliteTierSavings),
      cost: eliteTierCost,
      net: Math.round(eliteTierSavings - eliteTierCost),
      roi: Math.round(eliteROI),
    },
  ];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any): React.ReactElement | null => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.name} Tier</p>
          <p className="text-green-400 text-sm">Savings: {formatCurrency(data.savings)}</p>
          <p className="text-red-400 text-sm">Cost: {formatCurrency(data.cost)}</p>
          <p className="text-blue-400 text-sm font-semibold">Net: {formatCurrency(data.net)}</p>
          <p className="text-yellow-400 text-sm">ROI: {data.roi}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">ROI Calculator</h3>

      {/* Risk Assessment */}
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="text-red-300 font-semibold mb-2">Current Annual Risk Exposure</h4>
            <p className="text-3xl font-bold text-red-400 mb-2">{formatCurrency(totalAnnualRisk)}</p>
            <p className="text-sm text-gray-400">
              Based on your security score of {scorePercentage.toFixed(0)}%, your organization faces
              potential costs from breaches, downtime, compliance issues, and lost productivity.
            </p>
          </div>
        </div>
      </div>

      {/* Employee Count Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Employees
        </label>
        <input
          type="range"
          min="10"
          max="500"
          step="5"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10</span>
          <span className="text-white font-semibold">{employeeCount}</span>
          <span>500</span>
        </div>
      </div>

      {/* ROI Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Net Annual Savings by Tier</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={roiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="net" radius={[8, 8, 0, 0]}>
              {roiData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : '#8B5CF6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROI Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {roiData.map((tier, index) => (
          <div
            key={tier.name}
            className={`rounded-lg p-3 border ${
              index === 1
                ? 'bg-green-900/20 border-green-500/50 ring-1 ring-green-500/30'
                : 'bg-gray-900/50 border-gray-700'
            }`}
          >
            <p className="text-xs text-gray-400 mb-1">{tier.name}</p>
            <p className="text-xl font-bold text-white mb-1">{tier.roi}%</p>
            <p className="text-xs text-gray-400">ROI</p>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <span>💡</span>
          Key Insight
        </h4>
        <p className="text-sm text-gray-300">
          The Pro tier offers the best value with <span className="text-blue-400 font-semibold">{proROI}% ROI</span>,
          saving you <span className="text-green-400 font-semibold">{formatCurrency(roiData[1].net)}</span> annually
          while significantly reducing your security risk.
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        * Calculations based on industry averages for SMB security incidents, downtime costs, and compliance risks.
        Actual savings may vary based on your specific environment and risk factors.
      </p>
    </div>
  );
}
